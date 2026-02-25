import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "xx-xxxxxxxx",
  authDomain: "xx-xx.firebaseapp.com",
  projectId: "x-x-x",
  storageBucket: "x-x-x.firebasestorage.app",
  messagingSenderId: "x",
  appId: "1:x:x:x"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
