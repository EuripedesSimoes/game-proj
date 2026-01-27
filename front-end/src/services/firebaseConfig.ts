// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase-admin/app";
//getFirestore: olha a aplicação, olhas as chaves secretas do firebaseCoonfig e repassa pro Firestore se tem permissão de admin para acessar o banco de dados
// import { getFirestore } from 'firebase-admin/firestore'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// import { cert,  getApps, initializeApp,  } from 'firebase-admin/app'
// Your web app's Firebase configuration

// const firebaseConfig = {
//   apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
//   authDomain: "my-game-list-6fd0f.firebaseapp.com",
//   projectId: "my-game-list-6fd0f",
//   storageBucket: "my-game-list-6fd0f.firebasestorage.app",
//   messagingSenderId: "982341506588",
//   appId: "1:982341506588:web:ac89acb8295ac1c78531d9"
// };


import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// import { getFirestore, getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
  authDomain: "my-game-list-6fd0f.firebaseapp.com",
  projectId: "my-game-list-6fd0f",
  storageBucket: "my-game-list-6fd0f.firebasestorage.app",
  messagingSenderId: "982341506588",
  appId: "1:982341506588:web:ac89acb8295ac1c78531d9"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const storage = getStorage(firebaseApp)


export const db = getFirestore(firebaseApp)

export const auth = getAuth(firebaseApp)
// export const dbFirebase = getFirestore(firebaseApp);
