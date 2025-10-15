// Quick Firebase check script
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

console.log('🔍 Fetching all users from Firebase...\n');

const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);

console.log(`📊 Total users in database: ${snapshot.size}\n`);

const targetEmails = ['anantsoftcomputing@gmail.com', 'jeegarredesai@gmail.com'];

snapshot.forEach(doc => {
  const data = doc.data();
  const email = data.email || 'N/A';
  
  if (targetEmails.includes(email)) {
    console.log('✅ FOUND:');
    console.log(`   Email: ${email}`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Name: ${data.displayName || 'N/A'}`);
    console.log(`   Status: ${data.status || '❌ MISSING'}`);
    console.log(`   Last Seen: ${data.lastSeen ? data.lastSeen.toDate().toLocaleString() : 'N/A'}`);
    console.log('');
  }
});

process.exit(0);
