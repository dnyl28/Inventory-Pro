import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    signOut as firebaseSignOut, 
    GoogleAuthProvider 
} from "firebase/auth";
import { auth, firestore } from '@/firebase'; 
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.isAdmin) {
                // Optionally handle the case where the user is not an admin
                // For example, restrict certain actions in the UI
                console.warn("User is not an admin");
            }
        } else {
            console.warn("User document does not exist in Firestore");
        }

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.isAdmin) {
                // Optionally handle the case where the user is not an admin
                console.warn("User is not an admin");
            }
        } else {
            console.warn("User document does not exist in Firestore");
        }

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign up with email and password and send verification email
export const createUserWithEmail = async (email, password, firstName, lastName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with the user's full name
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
        });

        // Send email verification
        await sendEmailVerification(user);

        // Add user details to Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
            firstName,
            lastName,
            email,
            uid: user.uid,
            isAdmin: false, // Default to non-admin when creating a new user
            emailVerified: false, // Optional: Track email verification status
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign out
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        throw error;
    }
};
