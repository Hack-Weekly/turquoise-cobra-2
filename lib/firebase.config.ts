// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import firebase from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const initializeAppIfRequired = () => {
    try {
        return getApp();
    } catch (err) {
        return initializeApp(firebaseConfig);
    }
};

// Initialize Firebase
const app = initializeAppIfRequired();
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
if (process.env.NODE_ENV == "development") {
    connectAuthEmulator(auth, "http://localhost:9099");
    if (!(db as any)._settingsFrozen) {
        connectFirestoreEmulator(db, "localhost", 8080);
    }
}
