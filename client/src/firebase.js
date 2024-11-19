// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6laTFSGJbYK123a7-v2HaD3yEuK8-pQk",
  authDomain: "esspi-b8687.firebaseapp.com",
  projectId: "esspi-b8687",
  storageBucket: "esspi-b8687.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "769588553898",
  appId: "1:769588553898:web:5ede33114a6a517a6c48d3",
  measurementId: "G-M4B0Y1S3X6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the Firebase app
export default app;
