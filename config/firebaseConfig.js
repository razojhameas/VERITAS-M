import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your VERITAS Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAP9lfp1dI6GlRsqwt0oi73ZD0Eg30vS9A",
    authDomain: "veritas-c2a5c.firebaseapp.com",
    projectId: "veritas-c2a5c",
    storageBucket: "veritas-c2a5c.firebasestorage.app",
    messagingSenderId: "362361029473",
    appId: "1:362361029473:web:7e301260d7f3e8e4037b20"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase Firestore initialized successfully for VERITAS Mobile');
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

export { db };