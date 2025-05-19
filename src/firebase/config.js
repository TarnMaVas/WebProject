import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBo3SJjrV1N4lwOtN4NMMf2R3JNFson6Vg",
    authDomain: "snippetsearch-a38e2.firebaseapp.com",
    projectId: "snippetsearch-a38e2",
    storageBucket: "snippetsearch-a38e2.firebasestorage.app",
    messagingSenderId: "632995499773",
    appId: "1:632995499773:web:af9b72a3d4f1b02e543894",
    measurementId: "G-RKSC2L28S5"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
