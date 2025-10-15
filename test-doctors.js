import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIbt0doFhC23oyvpJqk6yEpC1bzOR5-uA",
  authDomain: "gazra-mitra.firebaseapp.com",
  projectId: "gazra-mitra",
  storageBucket: "gazra-mitra.firebasestorage.app",
  messagingSenderId: "130808551513",
  appId: "1:130808551513:web:d4723486d74bc94287f948",
  measurementId: "G-2G549BQ0LZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDoctors() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Get all professionals
    const allProfs = await getDocs(collection(db, 'professionals'));
    console.log('\n=== All Professionals ===');
    console.log('Total professionals:', allProfs.size);
    
    // Test 2: Check categories
    const categories = new Set();
    allProfs.forEach(doc => {
      const data = doc.data();
      categories.add(data.category);
      console.log(`- ${doc.id}: ${data.name} (${data.category})`);
    });
    
    console.log('\n=== Categories found ===');
    console.log(Array.from(categories));
    
    // Test 3: Try healthcare query
    console.log('\n=== Healthcare Professionals ===');
    const healthcareQuery = query(
      collection(db, 'professionals'),
      where('category', '==', 'healthcare')
    );
    const healthcareProfs = await getDocs(healthcareQuery);
    console.log('Healthcare professionals:', healthcareProfs.size);
    healthcareProfs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name}: ${data.specialization || 'N/A'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testDoctors();
