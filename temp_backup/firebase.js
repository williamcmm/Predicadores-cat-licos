// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8mSHMJxsuJsNigjZKJZBb2ifV0CXN-ME",
  authDomain: "predicadores-catolicos.firebaseapp.com",
  projectId: "predicadores-catolicos",
  storageBucket: "predicadores-catolicos.firebasestorage.app",
  messagingSenderId: "605560352237",
  appId: "1:605560352237:web:4ce295cf07c2d708ee4be4",
  measurementId: "G-F6GWKTTC3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);