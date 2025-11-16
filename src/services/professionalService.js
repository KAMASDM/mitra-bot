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
const AVAILABILITY_COLLECTION = 'availability_slots';
const EARNINGS_COLLECTION = 'earnings';
const SESSION_NOTES_COLLECTION = 'session_notes';
const DOCUMENTS_COLLECTION = 'professional_documents';

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
export const subscribeToProfessionalBookings = (professionalId, callback) => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('professionalId', '==', professionalId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  });
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status, notes = '') => {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(docRef, {
      status,
      notes,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
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
export const createAvailabilitySlot = async (professionalId, slotData) => {
  try {
    const docRef = await addDoc(collection(db, AVAILABILITY_COLLECTION), {
      professionalId,
      start_date: Timestamp.fromDate(new Date(slotData.start_date)),
      end_date: Timestamp.fromDate(new Date(slotData.end_date)),
      duration: slotData.duration || 60,
      status: 'available',
      type: slotData.type || 'online',
      location: slotData.location || '',
      price: slotData.price || 0,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating availability slot:', error);
    throw error;
  }
};

/**
 * Create multiple availability slots (bulk)
 */
export const createBulkAvailabilitySlots = async (professionalId, slots) => {
  try {
    const promises = slots.map(slot => createAvailabilitySlot(professionalId, slot));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error creating bulk availability slots:', error);
    throw error;
  }
};

/**
 * Update availability slot
 */
export const updateAvailabilitySlot = async (slotId, updates) => {
  try {
    const docRef = doc(db, AVAILABILITY_COLLECTION, slotId);
    const updateData = { ...updates };
    
    if (updates.start_date) {
      updateData.start_date = Timestamp.fromDate(new Date(updates.start_date));
    }
    if (updates.end_date) {
      updateData.end_date = Timestamp.fromDate(new Date(updates.end_date));
    }
    
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating availability slot:', error);
    throw error;
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
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (daysOfWeek.includes(dayOfWeek)) {
      timeSlots.forEach(timeSlot => {
        const [hours, minutes] = timeSlot.split(':');
        const slotStart = new Date(current);
        slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + (slotConfig.duration || 60));
        
        slots.push({
          start_date: slotStart,
          end_date: slotEnd,
          duration: slotConfig.duration || 60,
          type: slotConfig.type || 'online',
          location: slotConfig.location || '',
          price: slotConfig.price || 0
        });
      });
    }
    
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
