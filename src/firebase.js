import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD4g5jHh8IKpIc0CEvCyiixOOcf40B_Pzo",
    authDomain: "golf-stroke-iq.firebaseapp.com",
    projectId: "golf-stroke-iq",
    storageBucket: "golf-stroke-iq.firebasestorage.app",
    messagingSenderId: "243529794563",
    appId: "1:243529794563:web:cd9b68be5975c452c4fa36",
    measurementId: "G-472W1SV1LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };

// const analytics = getAnalytics(app);