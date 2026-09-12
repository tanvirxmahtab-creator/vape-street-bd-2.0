// Firebase services let this otherwise static Hostinger site manage its product catalog.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, orderBy, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbNEbJ5Mu70VY8pi5dpTvJcqoSmDdXzPk",
  authDomain: "vapestreetbd-7b455.firebaseapp.com",
  projectId: "vapestreetbd-7b455",
  storageBucket: "vapestreetbd-7b455.firebasestorage.app",
  messagingSenderId: "287447926020",
  appId: "1:287447926020:web:373f9a2e3b2ab942593c51"
};

export const isFirebaseConfigured = !Object.values(firebaseConfig).some(value => value.startsWith("PASTE_"));
let app, db, auth;
if (isFirebaseConfigured) { app = initializeApp(firebaseConfig); db = getFirestore(app); auth = getAuth(app); }
export { app, db, auth, collection, getDocs, getDoc, doc, query, where, orderBy, addDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, signInWithEmailAndPassword, signOut, onAuthStateChanged };
