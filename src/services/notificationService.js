import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import {
  sendBookingConfirmationEmail,
  sendAppointmentReminderEmail,
  sendMessageNotificationEmail,
  sendFeedbackRequestEmail
} from './emailService';

/**
 * Create a notification in Firestore
 */
export const createNotification = async (userId, title, message, type = 'general') => {
  try {
    const notificationRef = collection(db, 'notifications');
    await addDoc(notificationRef, {
      userId,
      title,
      message,
      type, // 'booking', 'message', 'reminder', 'general'
      read: false,
      createdAt: serverTimestamp()
    });
    console.log('Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get user details by userId
 */
const getUserDetails = async (userId) => {
  try {
    const userQuery = query(collection(db, 'users'), where('__name__', '==', userId));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return {
        email: userData.email,
        displayName: userData.displayName || 'User',
        language: userData.userLanguage || 'en'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

/**
 * Send booking confirmation notification
 */
export const notifyBookingConfirmation = async (bookingData) => {
  try {
    const { clientId, professionalId, serviceName, date, time, location, bookingId } = bookingData;
    
    // Get client details
    const clientDetails = await getUserDetails(clientId);
    if (!clientDetails) {
      console.error('Client details not found');
      return;
    }

    // Get professional details
    const professionalDetails = await getUserDetails(professionalId);
    const professionalName = professionalDetails?.displayName || 'Professional';

    // Create in-app notification
    await createNotification(
      clientId,
      'Booking Confirmed',
      `Your appointment with ${professionalName} has been confirmed for ${date} at ${time}`,
      'booking'
    );

    // Send email notification
    const emailBookingDetails = {
      userName: clientDetails.displayName,
      professionalName,
      serviceName,
      date,
      time,
      location,
      bookingId
    };

    await sendBookingConfirmationEmail(
      clientDetails.email,
      emailBookingDetails,
      clientDetails.language
    );

    console.log('Booking confirmation sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
};

/**
 * Send appointment reminder notification (24 hours before)
 */
export const notifyAppointmentReminder = async (bookingData) => {
  try {
    const { clientId, professionalId, serviceName, date, time, location } = bookingData;
    
    // Get client details
    const clientDetails = await getUserDetails(clientId);
    if (!clientDetails) {
      console.error('Client details not found');
      return;
    }

    // Get professional details
    const professionalDetails = await getUserDetails(professionalId);
    const professionalName = professionalDetails?.displayName || 'Professional';

    // Create in-app notification
    await createNotification(
      clientId,
      'Appointment Reminder',
      `Reminder: You have an appointment with ${professionalName} tomorrow at ${time}`,
      'reminder'
    );

    // Send email reminder
    const emailBookingDetails = {
      userName: clientDetails.displayName,
      professionalName,
      serviceName,
      date,
      time,
      location
    };

    await sendAppointmentReminderEmail(
      clientDetails.email,
      emailBookingDetails,
      clientDetails.language
    );

    console.log('Appointment reminder sent successfully');
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
  }
};

/**
 * Send new message notification
 */
export const notifyNewMessage = async (messageData) => {
  try {
    const { senderId, recipientId, messageText } = messageData;
    
    // Get sender details
    const senderDetails = await getUserDetails(senderId);
    const senderName = senderDetails?.displayName || 'Someone';

    // Get recipient details
    const recipientDetails = await getUserDetails(recipientId);
    if (!recipientDetails) {
      console.error('Recipient details not found');
      return;
    }

    // Create in-app notification
    await createNotification(
      recipientId,
      'New Message',
      `${senderName} sent you a message`,
      'message'
    );

    // Send email notification
    const messagePreview = messageText.length > 100 
      ? messageText.substring(0, 100) + '...' 
      : messageText;

    const emailMessageDetails = {
      recipientName: recipientDetails.displayName,
      senderName,
      messagePreview
    };

    await sendMessageNotificationEmail(
      recipientDetails.email,
      emailMessageDetails,
      recipientDetails.language
    );

    console.log('Message notification sent successfully');
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
};

/**
 * Send feedback request notification (after appointment completion)
 */
export const notifyFeedbackRequest = async (bookingData) => {
  try {
    const { clientId, professionalId, serviceName, bookingId } = bookingData;
    
    // Get client details
    const clientDetails = await getUserDetails(clientId);
    if (!clientDetails) {
      console.error('Client details not found');
      return;
    }

    // Get professional details
    const professionalDetails = await getUserDetails(professionalId);
    const professionalName = professionalDetails?.displayName || 'Professional';

    // Create in-app notification
    await createNotification(
      clientId,
      'Share Your Feedback',
      `How was your experience with ${professionalName}? Leave a review!`,
      'general'
    );

    // Send email feedback request
    const feedbackDetails = {
      userName: clientDetails.displayName,
      professionalName,
      serviceName,
      bookingId
    };

    await sendFeedbackRequestEmail(
      clientDetails.email,
      feedbackDetails,
      clientDetails.language
    );

    console.log('Feedback request sent successfully');
  } catch (error) {
    console.error('Error sending feedback request:', error);
  }
};

/**
 * Send booking cancellation notification
 */
export const notifyBookingCancellation = async (bookingData) => {
  try {
    const { clientId, professionalId, serviceName, date, time, cancellationReason } = bookingData;
    
    // Get client details
    const clientDetails = await getUserDetails(clientId);
    if (!clientDetails) {
      console.error('Client details not found');
      return;
    }

    // Get professional details
    const professionalDetails = await getUserDetails(professionalId);
    const professionalName = professionalDetails?.displayName || 'Professional';

    // Create in-app notification
    await createNotification(
      clientId,
      'Booking Cancelled',
      `Your appointment with ${professionalName} on ${date} at ${time} has been cancelled.`,
      'booking'
    );

    // Notify professional as well
    await createNotification(
      professionalId,
      'Booking Cancelled',
      `${clientDetails.displayName} cancelled their appointment for ${date} at ${time}.`,
      'booking'
    );

    console.log('Cancellation notifications sent successfully');
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
  }
};

/**
 * Schedule appointment reminders (call this periodically via cron job or cloud function)
 */
export const scheduleAppointmentReminders = async () => {
  try {
    // Get all bookings for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', tomorrowStr),
      where('status', '==', 'confirmed')
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    
    // Send reminder for each booking
    for (const doc of bookingsSnapshot.docs) {
      const bookingData = doc.data();
      await notifyAppointmentReminder({
        ...bookingData,
        bookingId: doc.id
      });
    }

    console.log(`Sent reminders for ${bookingsSnapshot.size} appointments`);
  } catch (error) {
    console.error('Error scheduling appointment reminders:', error);
  }
};
