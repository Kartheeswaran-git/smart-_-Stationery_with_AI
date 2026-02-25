import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBsSk3-J7Ub2kkAIAHYbICFLoAizQeFgF0",
  authDomain: "stationary-shop-db4e0.firebaseapp.com",
  projectId: "stationary-shop-db4e0",
  storageBucket: "stationary-shop-db4e0.firebasestorage.app",
  messagingSenderId: "1013727186543",
  appId: "1:1013727186543:web:905d5c7c3ede47191d079a"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;