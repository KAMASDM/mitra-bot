// Script to check user status in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTA7AM9gqIDEwKs_NZ3rE9OHJyV8i4tDw",
  authDomain: "gazra-mitra.firebaseapp.com",
  projectId: "gazra-mitra",
  storageBucket: "gazra-mitra.firebasestorage.app",
  messagingSenderId: "535979931271",
  appId: "1:535979931271:web:eda23a9819c6a3e02b8ee5",
  measurementId: "G-5CQZRJTK5N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in Firebase...\n');
    
    // Check specific users by email
    const emails = ['anantsoftcomputing@gmail.com', 'jeegarredesai@gmail.com'];
    
    for (const email of emails) {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log(`❌ User ${email} NOT FOUND in database`);
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`✅ User: ${email}`);
          console.log(`   ID: ${doc.id}`);
          console.log(`   Name: ${data.displayName || 'N/A'}`);
          console.log(`   Status: ${data.status || '❌ NOT SET'}`);
          console.log(`   Last Seen: ${data.lastSeen ? new Date(data.lastSeen.toDate()).toLocaleString() : 'N/A'}`);
          console.log('');
        });
      }
    }
    
    // Check all online users
    console.log('\n🟢 Checking all ONLINE users...');
    const onlineQuery = query(collection(db, 'users'), where('status', 'in', ['online', 'away']));
    const onlineSnapshot = await getDocs(onlineQuery);
    
    console.log(`Found ${onlineSnapshot.size} online/away users:\n`);
    
    onlineSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  ✓ ${data.displayName || 'Unknown'} (${data.email})`);
      console.log(`    Status: ${data.status}`);
      console.log(`    Last Seen: ${data.lastSeen ? new Date(data.lastSeen.toDate()).toLocaleString() : 'N/A'}`);
      console.log('');
    });
    
    if (onlineSnapshot.size === 0) {
      console.log('  ⚠️  No users are currently marked as online!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
