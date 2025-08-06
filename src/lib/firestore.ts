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
 * Crear una nueva cita
 */
export const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...appointmentData
    };
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw error;
  }
};

/**
 * Obtiene la disponibilidad de un rango de fechas
 * Retorna un objeto con las fechas como claves y la cantidad de citas como valores
 */
export const getMonthlyAvailability = async (startDate: Date, endDate: Date) => {
  try {
    // Formatear las fechas como strings YYYY-MM-DD para la consulta
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const querySnapshot = await getDocs(q);
    
    // Crear un mapa con todas las fechas inicializadas en 0
    const availabilityMap: Record<string, number> = {};
    
    // Contar la cantidad de citas por fecha
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date;
      
      if (!availabilityMap[date]) {
        availabilityMap[date] = 0;
      }
      
      availabilityMap[date]++;
    });
    
    return availabilityMap;
  } catch (error) {
    console.error('Error al obtener disponibilidad mensual:', error);
    throw error;
  }
};

/**
 * Tipo para los slots de tiempo disponibles/reservados
 */
export interface TimeSlotInfo {
  time: string;
  isAvailable: boolean;
  appointmentId?: string;
  service?: string;
  reservedBy?: string; // Nombre del cliente que reservó (para administradores)
}

/**
 * Tipo para la disponibilidad detallada por fecha
 */
export interface DetailedDateAvailability {
  date: string;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  timeSlots: TimeSlotInfo[];
}

/**
 * Obtiene la disponibilidad detallada de un mes completo con información de cada slot de tiempo
 */
/**
 * Obtiene los horarios disponibles para una fecha específica
 */
export const getAvailableTimeSlotsForDate = async (
  date: string, 
  allTimeSlots: string[] = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]
) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const querySnapshot = await getDocs(q);
    
    // Crear un mapa con todos los slots inicializados como disponibles
    const timeSlotInfo: TimeSlotInfo[] = allTimeSlots.map(time => ({
      time,
      isAvailable: true
    }));
    
    // Marcar como no disponibles los slots que ya están reservados
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const bookedTime = data.time;
      const slot = timeSlotInfo.find(s => s.time === bookedTime);
      
      if (slot) {
        slot.isAvailable = false;
        slot.appointmentId = doc.id;
        slot.service = data.service;
        // Añadir datos adicionales si son administradores
        slot.reservedBy = data.name;
      }
    });
    
    return {
      date,
      timeSlots: timeSlotInfo,
      totalSlots: allTimeSlots.length,
      availableSlots: timeSlotInfo.filter(s => s.isAvailable).length,
      bookedSlots: timeSlotInfo.filter(s => !s.isAvailable).length
    };
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};

export const getDetailedMonthlyAvailability = async (
  year: number, 
  month: number, 
  allTimeSlots: string[] = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]
) => {
  try {
    // Crear fecha para el primer y último día del mes
    const startDate = new Date(year, month - 1, 1); // Mes en JS es 0-indexed
    const endDate = new Date(year, month, 0); // Último día del mes
    
    // Formatear las fechas como strings YYYY-MM-DD para la consulta
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Consultar todas las citas del mes
    // Nota: Esta consulta requiere un índice compuesto en Firestore.
    // Hay dos formas de manejar esto:
    // 1. Usar dos consultas separadas (usamos esta opción para no requerir índice)
    // 2. Crear el índice compuesto en Firebase Console usando el link del error
    
    // Consulta simplificada para evitar índice compuesto
    const q = query(
      collection(db, 'appointments'),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Estructura para organizar las citas por fecha y hora
    const bookingsByDate: Record<string, Record<string, {
      appointmentId: string;
      service: string;
      reservedBy: string;
    }>> = {};
    
    // Organizar las citas
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Appointment;
      // Filtramos manualmente en vez de usar el where('status', 'in', ['pending', 'confirmed'])
      // para evitar el error de índice compuesto
      if (data.status === 'pending' || data.status === 'confirmed') {
        const date = data.date;
        const time = data.time;
        
        if (!bookingsByDate[date]) {
          bookingsByDate[date] = {};
        }
        
        bookingsByDate[date][time] = {
          appointmentId: doc.id,
          service: data.service,
          reservedBy: data.name
        };
      }
    });
    
    // Generar disponibilidad detallada para cada día del mes
    const availabilityDetail: Record<string, DetailedDateAvailability> = {};
    
    // Llenar cada día del mes
    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Verificar si es fin de semana (0 = domingo, 6 = sábado)
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Crear array de slots para este día
      const timeSlots: TimeSlotInfo[] = allTimeSlots.map(time => {
        // Si es fin de semana, marcar como no disponible
        if (isWeekend) {
          return {
            time,
            isAvailable: false,
            // Usamos un código especial para indicar que es por cierre, no por reserva
            appointmentId: 'weekend-closure'
          };
        }
        
        const isBooked = bookingsByDate[dateStr]?.[time] !== undefined;
        
        return {
          time,
          isAvailable: !isBooked,
          ...(isBooked && {
            appointmentId: bookingsByDate[dateStr][time].appointmentId,
            service: bookingsByDate[dateStr][time].service,
            reservedBy: bookingsByDate[dateStr][time].reservedBy
          })
        };
      });
      
      // Contar slots disponibles
      const bookedSlots = timeSlots.filter(slot => !slot.isAvailable).length;
      
      availabilityDetail[dateStr] = {
        date: dateStr,
        totalSlots: allTimeSlots.length,
        availableSlots: allTimeSlots.length - bookedSlots,
        bookedSlots,
        timeSlots
      };
    }
    
    return availabilityDetail;
  } catch (error) {
    console.error('Error al obtener disponibilidad detallada:', error);
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
