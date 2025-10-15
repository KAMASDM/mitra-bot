import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

async function checkCategories() {
  try {
    // Sign in anonymously to have auth context
    await signInAnonymously(auth);
    console.log('Authenticated successfully\n');
    
    console.log('Fetching all professionals...\n');
    const snapshot = await getDocs(collection(db, 'professionals'));
    
    console.log(`Total professionals in database: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('No professionals found in database!');
      process.exit(0);
    }
    
    // Group by category
    const byCategory = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'NO_CATEGORY';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push({
        id: doc.id,
        name: data.name || data.full_name || 'NO_NAME',
        specialization: data.specialization || data.specialty || 'N/A'
      });
    });
    
    console.log('=== CATEGORIES FOUND ===\n');
    Object.keys(byCategory).sort().forEach(category => {
      console.log(`\n📁 Category: "${category}" (${byCategory[category].length} professionals)`);
      byCategory[category].slice(0, 3).forEach(prof => {
        console.log(`   - ${prof.name}: ${prof.specialization}`);
      });
      if (byCategory[category].length > 3) {
        console.log(`   ... and ${byCategory[category].length - 3} more`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  }
}

checkCategories();
