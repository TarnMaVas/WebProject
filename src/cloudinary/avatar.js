import { uploadPreset, cloudinaryConfig } from "./config";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getCurrentUser } from "../firebase/auth";

export const uploadAvatar = async (imageFile) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("User must be logged in to upload an avatar");
  }

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "user_avatars");

  const timestamp = new Date().getTime();
  formData.append("public_id", `avatar_${user.uid}_${timestamp}`);

  formData.append("tags", `user_avatar,${user.uid}`);

  formData.append("angle", "0");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(cloudinaryConfig.uploadEndpoint, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    }).catch((err) => {
      if (err.name === "AbortError") {
        throw new Error(
          "Upload timed out. Please try again with a smaller image or check your connection."
        );
      }
      throw new Error(
        "Network error. Please check your connection and try again."
      );
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error details:", errorData);
      throw new Error(
        `Upload failed: ${
          errorData.error?.message || errorData.message || "Unknown error"
        }`
      );
    }
    const data = await response.json();

    const imageUrl = data.secure_url;

    await updateProfile(user, {
      photoURL: imageUrl,
    });

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          photoURL: imageUrl,
          updatedAt: new Date(),
        });
      } else {
        await setDoc(userDocRef, {
          photoURL: imageUrl,
          displayName: user.displayName || "",
          email: user.email || "",
          uid: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error("Error updating Firestore user document:", err);
      throw new Error(`Failed to update profile: ${err.message}`);
    }

    return imageUrl;
  } catch (error) {
    console.error("Avatar upload failed:", error);
    throw error;
  }
};

export const getAvatarUrl = (userId, options = {}) => {
  const user = getCurrentUser();
  const uid = userId || user?.uid;

  if (!uid) {
    return null;
  }

  const settings = {
    size: "medium",
    rounded: true,
    ...options,
  };

  const sizes = {
    small: "w_50,h_50",
    medium: "w_200,h_200",
    large: "w_500,h_500",
  };

  const size = sizes[settings.size] || sizes.medium;
  const rounding = settings.rounded ? "r_max" : "";

  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  const transformation = `${size},c_fill,g_face,a_0${
    rounding ? "," + rounding : ""
  }`;

  if (user?.photoURL && user.photoURL.includes("cloudinary")) {
    const urlParts = user.photoURL.split("/");
    const publicIdIndex = urlParts.findIndex((part) => part === "upload") + 2;
    if (publicIdIndex < urlParts.length) {
      const publicId = urlParts.slice(publicIdIndex).join("/").split("?")[0];
      return `${baseUrl}/${transformation}/${publicId}`;
    }
  }

  const timestamp = new Date().getTime();
  const publicId = `user_avatars/avatar_${uid}`;

  return `${baseUrl}/${transformation}/${publicId}?t=${timestamp}`;
};

export const getDefaultAvatar = (displayName = "", color = "15cd2e") => {
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "?";

  const svgContent = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#${color}" opacity="0.2" />
    <circle cx="50" cy="50" r="43" stroke="#${color}" stroke-width="2" fill="none" />
    <text x="50" y="62" font-family="Arial" font-size="35" font-weight="bold" fill="#${color}" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};
