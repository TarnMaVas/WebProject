import { useState, useEffect } from "react";
import AuthPopup from "./AuthPopup";
import AvatarPopup from "./AvatarPopup";
import { subscribeToAuthChanges } from "../firebase/auth";
import { uploadAvatar, getDefaultAvatar } from "../cloudinary/avatar";
import { auth } from "../firebase/config";
import { useToast } from "./ToastProvider";
import { useDialog } from "./DialogProvider";
import { useFirebaseWithNotifications } from "../hooks/useFirebaseWithNotifications";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileIcon.css";

const ProfileIcon = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const toast = useToast();
  const dialog = useDialog();
  const { logoutUser } = useFirebaseWithNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const toggleAuthPopup = () => {
    if (!user) {
      setIsAuthOpen(!isAuthOpen);
    }
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
  };
  const handleLogout = async () => {
    dialog.confirm("Are you sure you want to log out?", "Log Out", {
      onConfirm: async () => {
        await logoutUser();
      },
    });
  };
  const handleAvatarUpload = async (file) => {
    try {
      toast.showInfo("Uploading avatar...");

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          "Image is too large. Please select an image under 5MB."
        );
      }
      await uploadAvatar(file, {
        transformation: "w_500,h_500,c_fill,g_face,a_0",
        onProgress: (progress) => {
          if (progress === 100) {
            toast.showInfo("Finalizing upload...");
          }
        },
        suppressToast: false,
      });

      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;

      setUser(refreshedUser);
      setIsChangingAvatar(false);
      toast.showSuccess("Avatar updated successfully!");
    } catch (err) {
      console.error("Failed to update avatar:", err);
      let errorMessage = "Failed to update avatar";

      if (err.message) {
        if (err.message.includes("preset")) {
          errorMessage = "Avatar upload failed.";
        } else if (err.message.includes("Overwrite parameter")) {
          errorMessage =
            "Avatar upload settings are incorrect. Please contact support.";
        } else if (err.message.includes("timeout")) {
          errorMessage =
            "Upload timed out. Please try again with a smaller image.";
        } else {
          errorMessage = `Upload failed: ${err.message}`;
        }
      }

      toast.showError(errorMessage);
    }
  };
  return (
    <div className="profile-container">
      <div
        className={`profile-icon-wrapper ${user ? "logged-in" : ""}`}
        onClick={toggleAuthPopup}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="User Avatar"
            className="avatar-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getDefaultAvatar(user.displayName);
            }}
          />
        ) : (
          <div className="profile-icon-fallback">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>
      {user && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <p className="username">{user?.displayName || "User"}</p>
            <p className="email">{user?.email}</p>
          </div>
          <div className="dropdown-options">
            <button
              className="dropdown-option"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </button>
            <button
              className="dropdown-option"
              onClick={() => navigate("/snippets")}
            >
              My Snippets
            </button>
            <button className="dropdown-option" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}

      {isChangingAvatar && (
        <AvatarPopup
          onClose={() => setIsChangingAvatar(false)}
          onSave={handleAvatarUpload}
        />
      )}

      <AuthPopup
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ProfileIcon;
