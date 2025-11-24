import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCpLEKhHKr1zy98uyIlIRKPgPW9r22uqFc",
  authDomain: "owlister.firebaseapp.com",
  projectId: "owlister",
  storageBucket: "owlister.firebasestorage.app",
  messagingSenderId: "650780793412",
  appId: "1:650780793412:web:3bfdaac757eaff0e06ba11",
  measurementId: "G-DN8G2K0606"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
const db = app.firestore();
const auth = app.auth();
const storage = app.storage();

// Enable offline persistence to avoid "client is offline" errors
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence failed: Browser not supported');
  }
});

let analytics = null;
if (typeof window !== 'undefined') {
  if (firebase.analytics && typeof firebase.analytics === 'function') {
      analytics = firebase.analytics();
  }
}

export { db, auth, storage, analytics };