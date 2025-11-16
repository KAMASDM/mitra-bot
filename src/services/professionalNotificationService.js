import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  getDocs,
  doc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import toast from 'react-hot-toast';

const NOTIFICATIONS_COLLECTION = 'professional_notifications';

/**
 * Subscribe to real-time booking notifications for professionals
 */
export const subscribeToProfessionalNotifications = (professionalId, callback) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('professionalId', '==', professionalId),
    where('read', '==', false),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    
    // Show toast for new notifications
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const notification = {
          id: change.doc.id,
          ...change.doc.data()
        };
        
        // Show toast notification
        if (notification.type === 'new_booking') {
          toast.success('New booking request received!', {
            duration: 5000,
            icon: '📅'
          });
        } else if (notification.type === 'booking_cancelled') {
          toast.error('A booking was cancelled', {
            duration: 5000,
            icon: '❌'
          });
        }
      }
    });
    
    callback(notifications);
  }, (error) => {
    console.error('Error listening to notifications:', error);
  });
};

/**
 * Create a notification for a professional
 */
export const createProfessionalNotification = async (data) => {
  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      professionalId: data.professionalId,
      type: data.type, // 'new_booking', 'booking_cancelled', 'booking_updated', 'review_received'
      title: data.title,
      message: data.message,
      bookingId: data.bookingId || null,
      clientId: data.clientId || null,
      read: false,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
      read: true,
      readAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a professional
 */
export const markAllNotificationsAsRead = async (professionalId) => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('professionalId', '==', professionalId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: Timestamp.now()
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Subscribe to booking status changes
 */
export const subscribeToBookingUpdates = (professionalId, onNewBooking, onBookingUpdate) => {
  const q = query(
    collection(db, 'bookings'),
    where('professionalId', '==', professionalId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const booking = {
        id: change.doc.id,
        ...change.doc.data(),
        date: change.doc.data().date?.toDate(),
        createdAt: change.doc.data().createdAt?.toDate()
      };

      if (change.type === 'added') {
        // New booking
        onNewBooking && onNewBooking(booking);
        
        // Create notification
        createProfessionalNotification({
          professionalId,
          type: 'new_booking',
          title: 'New Booking Request',
          message: `You have a new booking request for ${booking.date?.toLocaleDateString()}`,
          bookingId: booking.id,
          clientId: booking.clientId
        }).catch(console.error);
        
      } else if (change.type === 'modified') {
        // Booking updated
        onBookingUpdate && onBookingUpdate(booking);
        
        // Create notification for cancellation
        if (booking.status === 'cancelled') {
          createProfessionalNotification({
            professionalId,
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `A booking for ${booking.date?.toLocaleDateString()} was cancelled`,
            bookingId: booking.id,
            clientId: booking.clientId
          }).catch(console.error);
        }
      }
    });
  });
};

export default {
  subscribeToProfessionalNotifications,
  createProfessionalNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToBookingUpdates
};
