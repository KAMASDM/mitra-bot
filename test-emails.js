/**
 * EMAIL NOTIFICATION SYSTEM - TEST SUITE
 * 
 * Use these functions to test email notifications in your browser console
 * or create a dedicated test page.
 */

import {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendAppointmentReminderEmail,
  sendMessageNotificationEmail,
  sendFeedbackRequestEmail
} from './src/services/emailService';

import {
  notifyBookingConfirmation,
  notifyAppointmentReminder,
  notifyNewMessage,
  notifyFeedbackRequest,
  notifyBookingCancellation
} from './src/services/notificationService';

/**
 * Test 1: Welcome Email (English)
 */
export const testWelcomeEmail = async () => {
  console.log('🧪 Testing Welcome Email...');
  try {
    const result = await sendWelcomeEmail(
      'test@example.com',
      'Test User',
      'en'
    );
    console.log('✅ Welcome email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }
};

/**
 * Test 2: Welcome Email (Gujarati)
 */
export const testWelcomeEmailGujarati = async () => {
  console.log('🧪 Testing Welcome Email (Gujarati)...');
  try {
    const result = await sendWelcomeEmail(
      'test@example.com',
      'પરીક્ષણ વપરાશકર્તા',
      'gu'
    );
    console.log('✅ Gujarati welcome email sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Gujarati welcome email failed:', error);
  }
};

/**
 * Test 3: Booking Confirmation Email
 */
export const testBookingConfirmation = async () => {
  console.log('🧪 Testing Booking Confirmation Email...');
  try {
    const result = await sendBookingConfirmationEmail('test@example.com', {
      userName: 'Priya Sharma',
      professionalName: 'Dr. Anjali Mehta',
      serviceName: 'Mental Health Counseling',
      date: '2025-11-25',
      time: '14:00',
      location: 'Downtown Wellness Center, Ahmedabad',
      bookingId: 'TEST-BK-12345'
    }, 'en');
    console.log('✅ Booking confirmation sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Booking confirmation failed:', error);
  }
};

/**
 * Test 4: Appointment Reminder Email
 */
export const testAppointmentReminder = async () => {
  console.log('🧪 Testing Appointment Reminder Email...');
  try {
    const result = await sendAppointmentReminderEmail('test@example.com', {
      userName: 'Raj Patel',
      professionalName: 'Dr. Kavita Singh',
      serviceName: 'General Checkup',
      date: 'Tomorrow (November 17, 2025)',
      time: '10:00 AM',
      location: '123 Main Street, Ahmedabad, Gujarat'
    }, 'hi');
    console.log('✅ Appointment reminder sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Appointment reminder failed:', error);
  }
};

/**
 * Test 5: Message Notification Email
 */
export const testMessageNotification = async () => {
  console.log('🧪 Testing Message Notification Email...');
  try {
    const result = await sendMessageNotificationEmail('test@example.com', {
      recipientName: 'Anjali',
      senderName: 'Dr. Kumar',
      messagePreview: 'Hi Anjali, I wanted to follow up on our last session and see how you\'re doing. Please let me know if you have any questions or concerns.'
    }, 'mr');
    console.log('✅ Message notification sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Message notification failed:', error);
  }
};

/**
 * Test 6: Feedback Request Email
 */
export const testFeedbackRequest = async () => {
  console.log('🧪 Testing Feedback Request Email...');
  try {
    const result = await sendFeedbackRequestEmail('test@example.com', {
      userName: 'Neha Desai',
      professionalName: 'Dr. Ravi Singh',
      serviceName: 'Therapy Session',
      bookingId: 'TEST-BK-67890'
    }, 'gu');
    console.log('✅ Feedback request sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Feedback request failed:', error);
  }
};

/**
 * Test 7: Complete Notification (In-app + Email)
 * Note: This requires valid user IDs in your Firestore database
 */
export const testCompleteNotification = async (clientId, professionalId) => {
  console.log('🧪 Testing Complete Notification System...');
  try {
    await notifyBookingConfirmation({
      clientId: clientId || 'test_client_id',
      professionalId: professionalId || 'test_prof_id',
      serviceName: 'Test Service',
      date: '2025-11-20',
      time: '15:00',
      location: 'Test Clinic, Test City',
      bookingId: 'TEST-COMPLETE-001'
    });
    console.log('✅ Complete notification sent (check both Firestore and email)');
  } catch (error) {
    console.error('❌ Complete notification failed:', error);
  }
};

/**
 * Run All Tests
 */
export const runAllEmailTests = async () => {
  console.log('🚀 Running All Email Tests...\n');
  
  await testWelcomeEmail();
  console.log('\n---\n');
  
  await testWelcomeEmailGujarati();
  console.log('\n---\n');
  
  await testBookingConfirmation();
  console.log('\n---\n');
  
  await testAppointmentReminder();
  console.log('\n---\n');
  
  await testMessageNotification();
  console.log('\n---\n');
  
  await testFeedbackRequest();
  console.log('\n---\n');
  
  console.log('✅ All tests completed! Check your email inbox.');
};

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. In Browser Console:
 *    import * as emailTests from './test-emails.js';
 *    await emailTests.testWelcomeEmail();
 * 
 * 2. Or create a test button in your UI:
 *    <button onClick={() => testWelcomeEmail()}>Test Welcome Email</button>
 * 
 * 3. Run all tests:
 *    await emailTests.runAllEmailTests();
 * 
 * 4. Test complete notification with real user IDs:
 *    await emailTests.testCompleteNotification('real_client_id', 'real_prof_id');
 */

/**
 * EXPECTED RESULTS:
 * 
 * ✅ Each test should:
 * 1. Log "Testing..." message
 * 2. Send email via EmailJS
 * 3. Log success message with result
 * 4. Email should arrive in 10-30 seconds
 * 
 * ❌ If test fails:
 * 1. Check EmailJS configuration in emailService.js
 * 2. Verify EmailJS service is active
 * 3. Check browser console for detailed error
 * 4. Verify recipient email is valid
 */

// Export individual test functions
export {
  testWelcomeEmail as test1_WelcomeEN,
  testWelcomeEmailGujarati as test2_WelcomeGU,
  testBookingConfirmation as test3_BookingConfirm,
  testAppointmentReminder as test4_Reminder,
  testMessageNotification as test5_Message,
  testFeedbackRequest as test6_Feedback,
  testCompleteNotification as test7_Complete
};
