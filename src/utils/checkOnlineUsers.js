// Diagnostic script to check online users in Firebase
// Run this in browser console to debug

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export const checkOnlineUsers = async () => {
  try {
    console.log('🔍 Checking all users in Firebase...');
    
    // Get ALL users (not just online)
    const allUsersQuery = query(collection(db, 'users'));
    const allUsersSnapshot = await getDocs(allUsersQuery);
    
    console.log('📊 Total users in database:', allUsersSnapshot.size);
    
    allUsersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`User: ${doc.id}`);
      console.log(`  - Name: ${data.displayName || 'N/A'}`);
      console.log(`  - Email: ${data.email || 'N/A'}`);
      console.log(`  - Status: ${data.status || 'NOT SET'}`);
      console.log(`  - Last Seen: ${data.lastSeen ? new Date(data.lastSeen.toDate()).toLocaleString() : 'N/A'}`);
      console.log('---');
    });
    
    // Now check specifically for online users
    const onlineQuery = query(
      collection(db, 'users'),
      where('status', 'in', ['online', 'away'])
    );
    const onlineSnapshot = await getDocs(onlineQuery);
    
    console.log('🟢 Online/Away users:', onlineSnapshot.size);
    onlineSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  ✓ ${data.displayName} (${data.email}) - ${data.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
};

// Make it available globally for testing
window.checkOnlineUsers = checkOnlineUsers;

console.log('💡 Run window.checkOnlineUsers() in console to diagnose');
