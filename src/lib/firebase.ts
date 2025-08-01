import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiWm_JI1fXlQ5dJjrcgc8uFM7sHEyr2jY",
  authDomain: "prueba-blaze.firebaseapp.com",
  projectId: "prueba-blaze",
  storageBucket: "prueba-blaze.appspot.com", // Corregido de firebasestorage.app a appspot.com
  messagingSenderId: "745728945089",
  appId: "1:745728945089:web:aebc27fbf55f50a6145d40",
  measurementId: "G-2CSVD4NNQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Auth functions
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: userData.name,
      phone: userData.phone,
      createdAt: serverTimestamp(),
      ...userData
    });
    
    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Firestore functions
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { userData: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { error: "No user data found" };
    }
  } catch (error: any) {
    return { error: error.message };
  }
};

export const addTestimonial = async (userId: string, testimonialData: any) => {
  try {
    // Verificar si el usuario ya ha dejado un testimonio
    const q = query(collection(db, "testimonials"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { error: "Ya has dejado un testimonio anteriormente" };
    }
    
    const docRef = await addDoc(collection(db, "testimonials"), {
      userId,
      createdAt: serverTimestamp(),
      ...testimonialData
    });
    
    return { id: docRef.id };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getTestimonials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "testimonials"));
    const testimonials = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { testimonials };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
