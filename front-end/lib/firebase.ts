// instanciar banco de dados e o storage e usar o arquivo por toda a aplicação

// precisoa de certificado para ter acesso ao banco de dados e ao bucket

// import {cert} from '../cert/firebase-admin.json';
import { cert,  getApps, initializeApp,  } from 'firebase-admin/app'
import "server-only"; // garante que esse arquivo só será executado no servidor



import admin from 'firebase-admin';
// import { getStorage } from 'firebase-admin/storage';
// import { getFirestore } from 'firebase-admin/firestore';
// import { initializeApp } from 'firebase-admin';

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase-admin/app";
//getFirestore: olha a aplicação, olhas as chaves secretas do firebaseCoonfig e repassa pro Firestore se tem permissão de admin para acessar o banco de dados
import { getFirestore } from 'firebase-admin/firestore'; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3O9HMlYZVdpcsVXzLpZHFMNeXoFpGbto",
  authDomain: "my-game-list-6fd0f.firebaseapp.com",
  projectId: "my-game-list-6fd0f",
  storageBucket: "my-game-list-6fd0f.firebasestorage.app",
  messagingSenderId: "982341506588",
  appId: "1:982341506588:web:ac89acb8295ac1c78531d9"
};

const firebaseApp = initializeApp(firebaseConfig);

export const dbFirebase = getFirestore(firebaseApp);

// Initialize Firebase
const app = initializeApp(firebaseConfig);





const decodedKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64!, 'base64').toString('utf-8');

export const firebaseCert = cert(
    {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: decodedKey,
    }
)

// // Initialize Firebase Admin SDK
// initializeApp(
//     {
//         credential: firebaseCert,
//         storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//     }
// );

// const firebaseApp = initializeApp({
//     apiKey: process.env.FIREBASE_API_KEY,
//     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.FIREBASE_PROJECT_ID,
// });



if (!getApps().length) { 
    initializeApp({
        credential: firebaseCert,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}
// export const storage = getStorage().bucket();
