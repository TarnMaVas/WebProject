import { useState, useEffect, useCallback } from "react";
import { auth } from "../firebase/config";
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
} from "firebase/auth";
import { uploadAvatar } from "../cloudinary/avatar";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  writeBatch,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useToast } from "../components/ToastProvider";

export const useUserProfile = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    snippetsCount: 0,
    favoritesCount: 0,
    commentsCount: 0,
    joinedDate: null,
  });
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserData(user.uid);
        fetchUserStats(user.uid);
      } else {
        setProfileData(null);
        setStats({
          snippetsCount: 0,
          favoritesCount: 0,
          commentsCount: 0,
          joinedDate: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData({
          ...userData,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate(),
        });
      } else {
        setProfileData({
          displayName: auth.currentUser?.displayName || "",
          email: auth.currentUser?.email || "",
          photoURL: auth.currentUser?.photoURL || "",
          createdAt: auth.currentUser?.metadata?.creationTime
            ? new Date(auth.currentUser.metadata.creationTime)
            : null,
        });
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const snippetsQuery = query(
        collection(db, "snippets"),
        where("authorId", "==", userId)
      );
      const snippetsSnapshot = await getDocs(snippetsQuery);

      const favoritesRef = doc(db, "favorites", userId);
      const favoritesDoc = await getDoc(favoritesRef);
      const favoritesCount = favoritesDoc.exists()
        ? (favoritesDoc.data().snippetIds || []).length
        : 0;
      let commentsCount = 0;
      const allSnippetsQuery = collection(db, "snippets");
      const allSnippetsSnapshot = await getDocs(allSnippetsQuery);

      allSnippetsSnapshot.forEach((doc) => {
        const snippetData = doc.data();
        if (snippetData.comments) {
          const userComments = snippetData.comments.filter(
            (comment) => comment.author && comment.author.id === userId
          );
          commentsCount += userComments.length;
        }
      });

      setStats({
        snippetsCount: snippetsSnapshot.size,
        favoritesCount,
        commentsCount,
        joinedDate: auth.currentUser?.metadata?.creationTime
          ? new Date(auth.currentUser.metadata.creationTime)
          : null,
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };
  const updateProfileData = useCallback(
    async (data) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          throw new Error("No authenticated user");
        }

        if (data.displayName && data.displayName !== currentUser.displayName) {
          await updateProfile(currentUser, {
            displayName: data.displayName,
          });
        }

        const userDocRef = doc(db, "users", currentUser.uid);

        const updateData = {
          updatedAt: new Date(),
        };

        if (data.displayName) {
          updateData.displayName = data.displayName;
        }

        const optionalFields = [
          "location",
          "website",
          "github",
          "twitter",
          "linkedin",
        ];
        optionalFields.forEach((field) => {
          if (data[field] !== undefined) {
            updateData[field] = data[field];
          }
        });
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          await updateDoc(userDocRef, updateData);
        } else {
          await setDoc(userDocRef, {
            ...updateData,
            email: currentUser.email,
            uid: currentUser.uid,
            photoURL: currentUser.photoURL || null,
            createdAt: new Date(),
          });
        }

        setProfileData((prev) => ({
          ...prev,
          ...data,
          updatedAt: new Date(),
        }));
        toast.showSuccess("Profile updated successfully");
        return true;
      } catch (err) {
        console.error("Error updating profile:", err);
        setError(err.message || "Failed to update profile");
        toast.showError(err.message || "Failed to update profile");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, toast]
  );
  const uploadUserAvatar = useCallback(
    async (file, options = {}) => {
      try {
        setLoading(true);
        setError(null);

        const uploadOptions = {
          transformation: "w_500,h_500,c_fill,g_face",
          onProgress: (progress) => {
            console.log(`Upload progress: ${progress}%`);
          },
          ...options,
        };

        const imageUrl = await uploadAvatar(file, uploadOptions);

        setProfileData((prev) => ({
          ...prev,
          photoURL: imageUrl,
          updatedAt: new Date(),
        }));

        if (!uploadOptions.suppressToast) {
          toast.showSuccess("Avatar uploaded successfully");
        }

        return imageUrl;
      } catch (err) {
        console.error("Error uploading avatar:", err);
        setError(err.message || "Failed to upload avatar");
        toast.showError(err.message || "Failed to upload avatar");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updateUserEmail = useCallback(
    async (newEmail, password) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          throw new Error("No authenticated user");
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);

        await updateEmail(currentUser, newEmail);

        setProfileData((prev) => ({
          ...prev,
          email: newEmail,
          updatedAt: new Date(),
        }));

        toast.showSuccess("Email updated successfully");
        return true;
      } catch (err) {
        console.error("Error updating email:", err);

        let errorMessage = "Failed to update email";
        if (err.code === "auth/requires-recent-login") {
          errorMessage = "Please log in again before changing your email";
        } else if (err.code === "auth/email-already-in-use") {
          errorMessage = "This email is already in use";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        }

        setError(errorMessage);
        toast.showError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, toast]
  );

  const updateUserPassword = useCallback(
    async (currentPassword, newPassword) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          throw new Error("No authenticated user");
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);

        await updatePassword(currentUser, newPassword);

        toast.showSuccess("Password updated successfully");
        return true;
      } catch (err) {
        console.error("Error updating password:", err);

        let errorMessage = "Failed to update password";
        if (err.code === "auth/requires-recent-login") {
          errorMessage = "Please log in again before changing your password";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Current password is incorrect";
        }

        setError(errorMessage);
        toast.showError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, toast]
  );

  const deleteUserAccount = useCallback(
    async (password) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          throw new Error("No authenticated user");
        }

        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        await reauthenticateWithCredential(currentUser, credential);

        const batch = writeBatch(db);

        const snippetsQuery = query(
          collection(db, "snippets"),
          where("authorId", "==", currentUser.uid)
        );
        const snippetsSnapshot = await getDocs(snippetsQuery);

        snippetsSnapshot.forEach((docSnapshot) => {
          batch.delete(doc(db, "snippets", docSnapshot.id));
        });

        batch.delete(doc(db, "favorites", currentUser.uid));

        batch.delete(doc(db, "users", currentUser.uid));

        await batch.commit();

        await currentUser.delete();

        toast.showSuccess("Your account has been deleted");
        return true;
      } catch (err) {
        console.error("Error deleting account:", err);

        let errorMessage = "Failed to delete account";
        if (err.code === "auth/requires-recent-login") {
          errorMessage = "Please log in again before deleting your account";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        }

        setError(errorMessage);
        toast.showError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentUser, toast]
  );

  const updateUserDisplayName = useCallback(
    async (newDisplayName) => {
      try {
        setLoading(true);
        setError(null);

        if (!currentUser) {
          throw new Error("No authenticated user");
        }

        await updateProfile(currentUser, { displayName: newDisplayName });

        toast.showSuccess("Username updated successfully");
        return { success: true };
      } catch (err) {
        console.error("Error updating display name:", err);

        const errorMessage = "Failed to update username";

        setError(errorMessage);
        toast.showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentUser, toast]
  );
  return {
    currentUser,
    profileData,
    stats,
    isLoading: loading,
    error,
    updateProfile: updateProfileData,
    uploadAvatar: uploadUserAvatar,
    updateUserDisplayName,
    updateUserEmail,
    updateUserPassword,
    deleteUserAccount,
    refreshStats: () => {
      if (currentUser) fetchUserStats(currentUser.uid);
    },
  };
};
