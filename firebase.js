// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import{ getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvVqUEc3YeXBP1mitw3djYAGHKweLvXfU",
  authDomain: "inventory-management-84779.firebaseapp.com",
  projectId: "inventory-management-84779",
  storageBucket: "inventory-management-84779.appspot.com",
  messagingSenderId: "739700084210",
  appId: "1:739700084210:web:e805ed578de30421d82f6b",
  measurementId: "G-EMT04T2J8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const firestore = getFirestore(app)
export{firestore}