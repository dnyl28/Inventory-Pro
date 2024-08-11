// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import the Firebase Authentication module
import { auth, firestore } from '@/firebase';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnVZj18dIS43qzB5v5XbBIvT6L_3qX3ok",
  authDomain: "inventory-management-86993.firebaseapp.com",
  projectId: "inventory-management-86993",
  storageBucket: "inventory-management-86993.appspot.com",
  messagingSenderId: "1061121484673",
  appId: "1:1061121484673:web:b7bede44c71f844048ea80"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication

export { firestore, auth }; // Export both Firestore and Auth
