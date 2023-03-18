// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import firebase from "firebase/app"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const initializeAppIfRequired = () => { 
    try {
        return getApp()
    } catch (err) { 

        const firebaseConfig = {
          apiKey: "",
          authDomain: "",
          projectId: "",
          storageBucket: "",
          messagingSenderId: "",
          appId: "",
          measurementId: ""
        };
        return initializeApp(firebaseConfig);
    }
}

// Initialize Firebase
const app = initializeAppIfRequired()
// const analytics = getAnalytics(app);
const auth = getAuth();

export {auth}