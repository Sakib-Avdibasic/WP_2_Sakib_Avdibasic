import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDN5OsSCnDJUR5UJCYiIEKXaeVk0hR6FXU",
  authDomain: "wp2026-b7a5c.firebaseapp.com",
  projectId: "wp2026-b7a5c",
  storageBucket: "wp2026-b7a5c.firebasestorage.app",
  messagingSenderId: "556898000",
  appId: "1:556898000:web:7027bbb1a8078cbefff0d5"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
