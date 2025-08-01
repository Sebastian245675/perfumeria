// Este archivo es solo para pruebas
// Ejecutar con: node src/lib/test-firebase-connection.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiWm_JI1fXlQ5dJjrcgc8uFM7sHEyr2jY",
  authDomain: "prueba-blaze.firebaseapp.com",
  projectId: "prueba-blaze",
  storageBucket: "prueba-blaze.appspot.com",
  messagingSenderId: "745728945089",
  appId: "1:745728945089:web:aebc27fbf55f50a6145d40",
  measurementId: "G-2CSVD4NNQJ"
};

async function testFirestore() {
  console.log("Iniciando prueba de conexión a Firebase...");
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("Firebase inicializado correctamente");
    
    // Intentar guardar un documento de prueba
    const testEmail = `test_${new Date().getTime()}@example.com`;
    console.log(`Intentando guardar email de prueba: ${testEmail}`);
    
    const emailData = {
      email: testEmail,
      createdAt: serverTimestamp(),
      test: true
    };
    
    const docRef = await addDoc(collection(db, 'emails'), emailData);
    console.log(`✅ Prueba exitosa: Documento guardado con ID: ${docRef.id}`);
    
  } catch (error) {
    console.error("❌ Error en la prueba:", error);
  }
}

testFirestore();
