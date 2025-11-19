import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

const PROFESSIONALS_COLLECTION = 'professionals';
const BOOKINGS_COLLECTION = 'bookings';
const AVAILABILITY_COLLECTION = 'availability';
const EARNINGS_COLLECTION = 'earnings';
const SESSION_NOTES_COLLECTION = 'session_notes';
const DOCUMENTS_COLLECTION = 'professional_documents';
const AVAILABILITY_SLOTS_COLLECTION = 'availabilitySlots';

// ===========================
// PROFESSIONAL PROFILE
// ===========================

/**
 * Get professional profile by user ID
 */
export const getProfessionalByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, PROFESSIONALS_COLLECTION),
      where('userId', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting professional by user ID:', error);
    throw error;
  }
};

/**
 * Update professional profile
 */
export const updateProfessionalProfile = async (professionalId, data) => {
  try {
    const docRef = doc(db, PROFESSIONALS_COLLECTION, professionalId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating professional profile:', error);
    throw error;
  }
};

/**
 * Create new professional profile
 */
export const createProfessionalProfile = async (userId, profileData) => {
  try {
    const docRef = await addDoc(collection(db, PROFESSIONALS_COLLECTION), {
      userId,
      ...profileData,
      verification_status: 'pending',
      rating: 0,
      totalReviews: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating professional profile:', error);
    throw error;
  }
};

// ===========================
// DASHBOARD STATS
// ===========================

/**
 * Get dashboard statistics for a professional
 */
export const getDashboardStats = async (professionalId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Get today's appointments
    const todayQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('date', '==', todayStr)
    );
    const todaySnapshot = await getDocs(todayQuery);
    const todayAppointments = todaySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get pending bookings
    const pendingQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('status', '==', 'pending')
    );
    const pendingSnapshot = await getDocs(pendingQuery);
    const pendingBookings = pendingSnapshot.size;

    // Get this month's earnings
    const earningsQuery = query(
      collection(db, EARNINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('status', '==', 'paid')
    );
    const earningsSnapshot = await getDocs(earningsQuery);
    
    let monthlyEarnings = 0;
    let totalEarnings = 0;
    
    earningsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const earningDate = data.paidAt?.toDate();
      totalEarnings += data.amount || 0;
      
      if (earningDate && earningDate >= startOfMonth) {
        monthlyEarnings += data.amount || 0;
      }
    });

    // Get professional profile for rating
    const professionalDoc = await getDoc(doc(db, PROFESSIONALS_COLLECTION, professionalId));
    const professionalData = professionalDoc.data();

    return {
      todayAppointments: todayAppointments.length,
      todayAppointmentsList: todayAppointments,
      pendingBookings,
      monthlyEarnings,
      totalEarnings,
      averageRating: professionalData?.rating || professionalData?.averageRating || 0,
      totalReviews: professionalData?.totalReviews || 0,
      verificationStatus: professionalData?.verification_status || 'pending'
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

// ===========================
// BOOKINGS MANAGEMENT
// ===========================

/**
 * Get all bookings for a professional
 */
export const getProfessionalBookings = async (professionalId, filters = {}) => {
  try {
    let q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId)
    );

    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters.startDate) {
      q = query(q, where('date', '>=', filters.startDate));
    }

    if (filters.endDate) {
      q = query(q, where('date', '<=', filters.endDate));
    }

    // Order by date and time
    q = query(q, orderBy('date', 'desc'), orderBy('time', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting professional bookings:', error);
    throw error;
  }
};

/**
 * Subscribe to booking updates in real-time
 */
// export const subscribeToProfessionalBookings = (professionalId, callback) => {
//   const q = query(
//     collection(db, BOOKINGS_COLLECTION),
//     where('professionalId', '==', professionalId),
//     orderBy('date', 'desc')
//   );

//   return onSnapshot(q, (snapshot) => {
//     const bookings = snapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     callback(bookings);
//   });
// };

export const subscribeToProfessionalBookings = (professionalId, callback) => {
  if (!professionalId) {
    console.error('Professional ID is required for subscription');
    return () => { }; // Return an empty unsubscribe function
  }
  try {
    const bookingsQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('appointmentDate', 'asc')
    );

    const unsubscribe = onSnapshot(bookingsQuery, (querySnapshot) => {
      const bookings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JS Date object
          appointmentDate: data.appointmentDate.toDate(),
        });
      });
      // This callback will be triggered every time the bookings data changes for this professional
      callback({ success: true, bookings });
    }, (error) => {
      console.error('Error in bookings subscription:', error);
      callback({ success: false, error: error.message, bookings: [] });
    });
    return unsubscribe; // Return the function to stop the listener
  } catch (error) {
    console.error('Error setting up bookings subscription:', error);
    return () => { };
  }
};
/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status, additionalData = {}) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status,
      ...additionalData,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return { error: error.message, success: false };
  }
};

/**
 * Accept a booking request
 */
export const acceptBooking = async (bookingId) => {
  return updateBookingStatus(bookingId, 'confirmed');
};

/**
 * Reject a booking request
 */
export const rejectBooking = async (bookingId, reason = '') => {
  return updateBookingStatus(bookingId, 'rejected', reason);
};

/**
 * Mark booking as completed
 */
export const completeBooking = async (bookingId) => {
  return updateBookingStatus(bookingId, 'completed');
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId, reason = '') => {
  return updateBookingStatus(bookingId, 'cancelled', reason);
};

// ===========================
// AVAILABILITY MANAGEMENT
// ===========================

/**
 * Get availability slots for a professional
 */
export const getAvailabilitySlots = async (professionalId, filters = {}) => {
  try {
    let q = query(
      collection(db, AVAILABILITY_COLLECTION),
      where('professionalId', '==', professionalId)
    );

    if (filters.startDate) {
      q = query(q, where('start_date', '>=', Timestamp.fromDate(new Date(filters.startDate))));
    }

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('start_date', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      start_date: doc.data().start_date?.toDate(),
      end_date: doc.data().end_date?.toDate()
    }));
  } catch (error) {
    console.error('Error getting availability slots:', error);
    throw error;
  }
};

/**
 * Create availability slot
 */
export const createAvailabilitySlot = async (slotData) => {
  try {
    // Convert JS Date objects to Firestore Timestamps before saving
    const slotPayload = {
      ...slotData,
      start_date: Timestamp.fromDate(slotData.start_date),
      end_date: Timestamp.fromDate(slotData.end_date),
      created_at: Timestamp.now(), // Use Firestore Timestamp for creation date
      is_cancelled: slotData.is_cancelled || false,
      is_booked: slotData.is_booked || false,
    };

    const docRef = await addDoc(collection(db, AVAILABILITY_SLOTS_COLLECTION), slotPayload);
    console.log("Successfully saved event to Firestore with ID:", docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error("Error creating availability slot:", error);
    return { success: false, error: error.message };
  }
};
/**
 * Create multiple availability slots (bulk)
 */
export const createBulkAvailabilitySlots = async (professionalId, slots) => {
  try {
    // Use Promise.all to map and execute multiple single slot creations
    const promises = slots.map(slot => createAvailabilitySlot(slot)); 
    const results = await Promise.all(promises);

    // Check for any failures in the bulk operation
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.warn(`Bulk slot creation had ${failed.length} failure(s).`);
    }

    return { success: true, count: slots.length, failures: failed.length };
  } catch (error) {
    console.error('Error creating bulk availability slots:', error);
    throw error;
  }
};


/**
 * Update availability slot
 */
export const updateAvailabilitySlot = async (slotId, slotData) => {
  try {
    const slotRef = doc(db, 'availabilitySlots', slotId);
    await updateDoc(slotRef, slotData);
    console.log("Successfully updated event in Firestore with ID:", slotId);
    return { success: true };
  } catch (error) {
    console.error("Error updating availability slot:", error);
    return { success: false, error: error.message };
  }
};


/**
 * Delete availability slot
 */
export const deleteAvailabilitySlot = async (slotId) => {
  try {
    await deleteDoc(doc(db, AVAILABILITY_COLLECTION, slotId));
    return true;
  } catch (error) {
    console.error('Error deleting availability slot:', error);
    throw error;
  }
};

/**
 * Generate recurring slots
 */
export const generateRecurringSlots = (startDate, endDate, timeSlots, daysOfWeek, slotConfig) => {
  const slots = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); 
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); 

  while (current.getTime() <= end.getTime()) {
    const dayOfWeek = current.getDay();
    
    if (daysOfWeek.includes(dayOfWeek)) {
      timeSlots.forEach(timeSlot => {
        const [hours, minutes] = timeSlot.split(':');
        
        // Clone 'current' date and set time
        const slotStart = new Date(current);
        slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + (slotConfig.duration || 60));
        
        slots.push({
          professional_id: slotConfig.professional_id,
          title: slotConfig.title || 'Available Slot', 
          is_booked: slotConfig.is_booked || false, 
          is_cancelled: slotConfig.is_cancelled || false, 
          
          start_date: slotStart,
          end_date: slotEnd,
          duration: slotConfig.duration || 60,
          type: slotConfig.type || 'online',
          location: slotConfig.location || 'Online',
          price: slotConfig.price || 0
        });
      });
    }
    
    // Move to the next day
    current.setDate(current.getDate() + 1);
  }

  return slots;
};

// ===========================
// EARNINGS
// ===========================

/**
 * Get earnings for a professional
 */
export const getEarnings = async (professionalId, filters = {}) => {
  try {
    let q = query(
      collection(db, EARNINGS_COLLECTION),
      where('professionalId', '==', professionalId)
    );

    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    q = query(q, orderBy('paidAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paidAt: doc.data().paidAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting earnings:', error);
    throw error;
  }
};

/**
 * Create earning record
 */
export const createEarning = async (earningData) => {
  try {
    const docRef = await addDoc(collection(db, EARNINGS_COLLECTION), {
      ...earningData,
      paidAt: Timestamp.now(),
      currency: 'INR'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating earning:', error);
    throw error;
  }
};

// ===========================
// SESSION NOTES
// ===========================

/**
 * Get session notes for a booking
 */
export const getSessionNotes = async (professionalId, bookingId) => {
  try {
    const q = query(
      collection(db, SESSION_NOTES_COLLECTION),
      where('professionalId', '==', professionalId),
      where('bookingId', '==', bookingId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting session notes:', error);
    throw error;
  }
};

/**
 * Create session note
 */
export const createSessionNote = async (noteData) => {
  try {
    const docRef = await addDoc(collection(db, SESSION_NOTES_COLLECTION), {
      ...noteData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating session note:', error);
    throw error;
  }
};

/**
 * Update session note
 */
export const updateSessionNote = async (noteId, updates) => {
  try {
    const docRef = doc(db, SESSION_NOTES_COLLECTION, noteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating session note:', error);
    throw error;
  }
};

// ===========================
// DOCUMENTS
// ===========================

/**
 * Get professional documents
 */
export const getProfessionalDocuments = async (professionalId) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('professionalId', '==', professionalId),
      orderBy('uploadedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate(),
      verifiedAt: doc.data().verifiedAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting professional documents:', error);
    throw error;
  }
};

/**
 * Upload professional document
 */
export const uploadProfessionalDocument = async (professionalId, documentData) => {
  try {
    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), {
      professionalId,
      documentType: documentData.documentType,
      fileUrl: documentData.fileUrl,
      fileName: documentData.fileName,
      uploadedAt: Timestamp.now(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error uploading professional document:', error);
    throw error;
  }
};

// ===========================
// ANALYTICS
// ===========================

/**
 * Get booking analytics
 */
export const getBookingAnalytics = async (professionalId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => doc.data());
    
    const analytics = {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      bookingsByDate: {}
    };
    
    // Group by date
    bookings.forEach(booking => {
      if (!analytics.bookingsByDate[booking.date]) {
        analytics.bookingsByDate[booking.date] = 0;
      }
      analytics.bookingsByDate[booking.date]++;
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting booking analytics:', error);
    throw error;
  }
};

export default {
  // Profile
  getProfessionalByUserId,
  updateProfessionalProfile,
  createProfessionalProfile,
  
  // Dashboard
  getDashboardStats,
  
  // Bookings
  getProfessionalBookings,
  subscribeToProfessionalBookings,
  updateBookingStatus,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  
  // Availability
  getAvailabilitySlots,
  createAvailabilitySlot,
  createBulkAvailabilitySlots,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  generateRecurringSlots,
  
  // Earnings
  getEarnings,
  createEarning,
  
  // Notes
  getSessionNotes,
  createSessionNote,
  updateSessionNote,
  
  // Documents
  getProfessionalDocuments,
  uploadProfessionalDocument,
  
  // Analytics
  getBookingAnalytics
};
