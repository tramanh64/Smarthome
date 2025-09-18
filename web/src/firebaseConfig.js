// Import các hàm cần thiết từ SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYcu4Ffgv5e4HlTxC5VuTWaztiayv3SLM",
  authDomain: "smarthome-project-3ac72.firebaseapp.com",
  projectId: "smarthome-project-3ac72",
  storageBucket: "smarthome-project-3ac72.firebasestorage.app",
  messagingSenderId: "744032553711",
  appId: "1:744032553711:web:2de4c4601994e088e7a91a",
  measurementId: "G-JHM392P3D7"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Xuất ra các dịch vụ để các file khác trong project có thể sử dụng
export const auth = getAuth(app);
export const db = getFirestore(app);