// import { initializeApp } from "firebase/app"
// import { getAuth } from "firebase/auth"
// import { getFirestore } from "firebase/firestore"

// const firebaseConfig = {
//   apiKey: "AIzaSyAeiZ-838gDATVqV5ykyCpevaWXkBMJqaM",
//   authDomain: "task-manager-ead57.firebaseapp.com",
//   projectId: "task-manager-ead57",
//   storageBucket: "task-manager-ead57.firebasestorage.app",
//   messagingSenderId: "544806961634",
//   appId: "1:544806961634:web:a8ec18ef16a718c84579bb"
// }

// const app = initializeApp(firebaseConfig)

// export const auth = getAuth(app)
// export const db = getFirestore(app)

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjZUwZ6EdTtqgkGLT3WLcBetfD1qPcF9k",
  authDomain: "daily-journal-app-69e67.firebaseapp.com",
  projectId: "daily-journal-app-69e67",
  storageBucket: "daily-journal-app-69e67.firebasestorage.app",
  messagingSenderId: "832880793755",
  appId: "1:832880793755:web:ef3745f84b4f6c40ddce3e",
  measurementId: "G-4N7H2GQMYL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
