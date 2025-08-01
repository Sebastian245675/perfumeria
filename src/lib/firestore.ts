import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Types
export interface Appointment {
  id?: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  duracion: string;
  participants: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any; // serverTimestamp
}

// ====== APPOINTMENTS ======

/**
 * Verifica si una fecha y hora ya están reservadas
 */
export const checkAppointmentAvailability = async (date: string, time: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      where('time', '==', time),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const querySnapshot = await getDocs(q);
    return {
      available: querySnapshot.empty,
      count: querySnapshot.size
    };
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    throw error;
  }
};

/**
 * Guarda una nueva cita en Firestore
 */
export const saveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
  try {
    // Verificar disponibilidad antes de guardar
    const { available } = await checkAppointmentAvailability(
      appointmentData.date, 
      appointmentData.time
    );
    
    if (!available) {
      throw new Error('La fecha y hora seleccionadas ya no están disponibles. Por favor elige otro horario.');
    }
    
    const appointmentWithTimestamp = {
      ...appointmentData,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'appointments'), appointmentWithTimestamp);
    return { id: docRef.id, ...appointmentWithTimestamp };
  } catch (error) {
    console.error('Error al guardar la cita:', error);
    throw error;
  }
};

/**
 * Obtiene todas las citas de un usuario
 */
export const getUserAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Appointment));
  } catch (error) {
    console.error('Error al obtener las citas del usuario:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una cita
 */
export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { 
      status,
      updatedAt: serverTimestamp() 
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar el estado de la cita:', error);
    throw error;
  }
};

/**
 * Cancela una cita
 */
export const cancelAppointment = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, 'cancelled');
};

// ====== EMAILS ======

/**
 * Guarda un email en la colección de emails para newsletter
 */
export const saveEmail = async (email: string) => {
  try {
    console.log("Inicio de saveEmail con:", email);
    
    // Crear referencia a la colección
    const emailsCollectionRef = collection(db, 'emails');
    console.log("Colección de referencia creada");
    
    // Verificar si el email ya existe
    const q = query(
      emailsCollectionRef,
      where('email', '==', email),
      limit(1)
    );
    console.log("Query creada para verificar duplicados");
    
    const querySnapshot = await getDocs(q);
    console.log("Resultados de búsqueda:", querySnapshot.size);
    
    if (!querySnapshot.empty) {
      console.log("Email duplicado encontrado");
      throw new Error('Este email ya está registrado en nuestra lista.');
    }
    
    // Guardar el nuevo email
    const emailData = {
      email,
      createdAt: serverTimestamp(),
      fechaRegistro: new Date().toISOString() // Fecha legible como respaldo
    };
    
    console.log("Intentando guardar email con datos:", emailData);
    const docRef = await addDoc(emailsCollectionRef, emailData);
    console.log("Email guardado exitosamente con ID:", docRef.id);
    
    return { id: docRef.id, ...emailData };
  } catch (error) {
    console.error("Error detallado al guardar el email:", error);
    throw error;
  }
};

// ====== TESTIMONIALS ======

/**
 * Verifica si un usuario ya ha dejado un testimonio
 */
export const hasUserSubmittedTestimonial = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'testimonials'),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error al verificar si el usuario ya ha dejado un testimonio:', error);
    throw error;
  }
};

/**
 * Obtiene el testimonio de un usuario
 */
export const getUserTestimonial = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'testimonials'),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error al obtener el testimonio del usuario:', error);
    throw error;
  }
};
