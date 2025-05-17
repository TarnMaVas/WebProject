import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from './config'; // ✅ still okay — only uses auth

const storage = getStorage(); // ✅ create it locally, don't import from config

export const uploadUserAvatar = async (file) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');

        console.log('Uploading file:', file);

        const avatarRef = ref(storage, `avatars/${user.uid}`);
        const snapshot = await uploadBytes(avatarRef, file);
        console.log('Upload snapshot:', snapshot);

        const url = await getDownloadURL(avatarRef);
        console.log('Download URL:', url);

        await updateProfile(user, { photoURL: url });

        return url;
    } catch (err) {
        console.error('Upload failed:', err);
        throw err;
    }
};
