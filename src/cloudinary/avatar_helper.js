import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const checkCloudinaryAvatarExists = async (userId) => {
  if (!userId) return false;

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (
      userDoc.exists() &&
      userDoc.data().photoURL &&
      userDoc.data().photoURL.includes("cloudinary")
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.debug("Error checking if Cloudinary avatar exists:", error);
    return false;
  }
};
