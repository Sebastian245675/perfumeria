import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Definición del tipo de datos para las fragancias propuestas
export interface PropuestaFragancia {
  id?: string;
  userId?: string | null;
  nombre: string;
  descripcion: string;
  inspiracion: string;
  notas: {
    salida: string[] | string;
    corazon: string[] | string;
    fondo: string[] | string;
  };
  personalidad: string;
  genero: 'masculino' | 'femenino' | 'unisex';
  ocasion: string;
  intensidad: number; // De 1 a 5
  duracion: number; // Estimada en horas
  estacion: string[] | string; // Puede ser múltiples o una sola
  status: 'pendiente' | 'revisada' | 'aprobada' | 'rechazada';
  email: string; // Para contactar si no está autenticado
  nombre_contacto: string;
  createdAt?: any; // serverTimestamp
}

/**
 * Guarda una propuesta de fragancia en Firestore
 */
export const guardarPropuestaFragancia = async (data: Omit<PropuestaFragancia, 'id' | 'createdAt'>) => {
  try {
    // Formatear los datos antes de guardar
    const propuestaData = {
      ...data,
      createdAt: serverTimestamp(),
      status: 'pendiente' as const, // Todas las propuestas comienzan como pendientes
      intensidad: Number(data.intensidad),
      duracion: Number(data.duracion),
      // Aseguramos que las notas sean arrays
      notas: {
        salida: Array.isArray(data.notas.salida) ? data.notas.salida : data.notas.salida.split(',').map(item => item.trim()),
        corazon: Array.isArray(data.notas.corazon) ? data.notas.corazon : data.notas.corazon.split(',').map(item => item.trim()),
        fondo: Array.isArray(data.notas.fondo) ? data.notas.fondo : data.notas.fondo.split(',').map(item => item.trim()),
      },
      // Aseguramos que estación sea un array
      estacion: Array.isArray(data.estacion) ? data.estacion : [data.estacion]
    };
    
    // Guardar en Firestore
    const docRef = await addDoc(collection(db, 'fragancias'), propuestaData);
    return { id: docRef.id, ...propuestaData };
  } catch (error: any) {
    console.error('Error al guardar la propuesta de fragancia:', error);
    throw error;
  }
};

/**
 * Obtiene las fragancias propuestas por un usuario
 */
export const getPropuestasUsuario = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'fragancias'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PropuestaFragancia));
  } catch (error) {
    console.error('Error al obtener las propuestas del usuario:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario ya ha enviado una propuesta en las últimas 24 horas
 * Para limitar spam
 */
export const verificarPropuestaReciente = async (userId: string | null, email: string) => {
  try {
    let q;
    
    // Si el usuario está autenticado, buscar por userId
    if (userId) {
      q = query(
        collection(db, 'fragancias'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    } else {
      // Si no está autenticado, buscar por email
      q = query(
        collection(db, 'fragancias'),
        where('email', '==', email),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { puedeEnviar: true };
    }
    
    // Verificar si la última propuesta fue hace menos de 24 horas
    const ultimaPropuesta = querySnapshot.docs[0].data() as any;
    // Cast para solucionar el error de tipado
    const ultimaFecha = ultimaPropuesta.createdAt ? 
      ultimaPropuesta.createdAt.toDate() : 
      new Date();
    const ahora = new Date();
    const diferencia = ahora.getTime() - ultimaFecha.getTime();
    const horasTranscurridas = diferencia / (1000 * 60 * 60);
    
    return {
      puedeEnviar: horasTranscurridas >= 24,
      tiempoRestante: 24 - horasTranscurridas
    };
  } catch (error) {
    console.error('Error al verificar propuestas recientes:', error);
    throw error;
  }
};
