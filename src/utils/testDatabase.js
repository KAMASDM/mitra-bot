import { searchProfessionals, searchJobs, getProfessionalTypes } from '../services/databaseService.js';

// Test script to verify database connectivity and data retrieval
const testDatabaseConnection = async () => {
  console.log('🔍 Testing Gazra Mitra Database Connection...\n');

  try {
    // Test 1: Search for professionals
    console.log('📋 Test 1: Searching for professionals...');
    const professionals = await searchProfessionals({ limit: 3 });
    console.log(`✅ Found ${professionals.length} professionals`);
    
    if (professionals.length > 0) {
      professionals.forEach((prof, index) => {
        console.log(`   ${index + 1}. ${prof.name || 'N/A'} - ${prof.category || 'N/A'} (Rating: ${prof.rating || 'N/A'})`);
      });
    }
    console.log('');

    // Test 2: Search for jobs
    console.log('💼 Test 2: Searching for jobs...');
    const jobs = await searchJobs({ limit: 3 });
    console.log(`✅ Found ${jobs.length} job opportunities`);
    
    if (jobs.length > 0) {
      jobs.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title || 'N/A'} at ${job.company || 'N/A'} (${job.location || 'N/A'})`);
      });
    }
    console.log('');

    // Test 3: Get professional types
    console.log('🏥 Test 3: Getting professional types...');
    const professionalTypes = await getProfessionalTypes();
    console.log(`✅ Found ${professionalTypes.length} professional types`);
    
    if (professionalTypes.length > 0) {
      professionalTypes.slice(0, 5).forEach((type, index) => {
        console.log(`   ${index + 1}. ${type.name || type.id || 'N/A'}`);
      });
    }
    console.log('');

    // Test 4: Search healthcare professionals specifically
    console.log('🩺 Test 4: Searching for healthcare professionals...');
    const doctors = await searchProfessionals({ 
      category: 'healthcare',
      verified: true,
      limit: 2
    });
    console.log(`✅ Found ${doctors.length} verified healthcare professionals`);
    
    if (doctors.length > 0) {
      doctors.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.name || 'N/A'} - ${doc.specialization || 'General'} (₹${doc.price || 'Contact for price'})`);
      });
    }
    console.log('');

    console.log('🎉 Database connection test completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Professionals: ${professionals.length}`);
    console.log(`   - Jobs: ${jobs.length}`);
    console.log(`   - Professional Types: ${professionalTypes.length}`);
    console.log(`   - Healthcare Professionals: ${doctors.length}`);

  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  }
};

// Run the test
testDatabaseConnection();