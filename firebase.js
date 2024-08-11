import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCnVZj18dIS43qzB5v5XbBIvT6L_3qX3ok",
  authDomain: "inventory-management-86993.firebaseapp.com",
  projectId: "inventory-management-86993",
  storageBucket: "inventory-management-86993.appspot.com",
  messagingSenderId: "1061121484673",
  appId: "1:1061121484673:web:b7bede44c71f844048ea80"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };