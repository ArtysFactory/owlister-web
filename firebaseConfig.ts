
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCpLEKhHKr1zy98uyIlIRKPgPW9r22uqFc",
  authDomain: "owlister.firebaseapp.com",
  projectId: "owlister",
  storageBucket: "owlister.firebasestorage.app",
  messagingSenderId: "650780793412",
  appId: "1:650780793412:web:3bfdaac757eaff0e06ba11",
  measurementId: "G-DN8G2K0606"
};

// Initialize Firebase (v8 compat)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
const db = app.firestore();
const auth = app.auth();
const storage = app.storage();

let analytics = null;
if (typeof window !== 'undefined') {
  // Graceful check for analytics support
  if (firebase.analytics && typeof firebase.analytics === 'function') {
      analytics = firebase.analytics();
  }
}

export { db, auth, storage, analytics };
