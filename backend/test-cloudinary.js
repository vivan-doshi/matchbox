// Test script to verify Cloudinary connection
require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('🔍 Testing Cloudinary Connection...\n');

// Display configuration (without showing secrets)
console.log('Configuration:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  API Key:', process.env.CLOUDINARY_API_KEY?.substring(0, 4) + '***');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET?.substring(process.env.CLOUDINARY_API_SECRET.length - 4) : 'Not set');
console.log('');

// Test the connection by making an API call
async function testConnection() {
  try {
    console.log('📡 Pinging Cloudinary API...');

    // Use the admin API to check usage/resources
    const result = await cloudinary.api.ping();

    console.log('✅ SUCCESS! Cloudinary connection is working!\n');
    console.log('Response:', result);
    console.log('');

    // Try to get account usage info
    try {
      const usage = await cloudinary.api.usage();
      console.log('📊 Account Usage:');
      console.log('  Plan:', usage.plan);
      console.log('  Credits Used:', usage.credits?.used || 0);
      console.log('  Credits Limit:', usage.credits?.limit || 'Unlimited');
      console.log('  Storage Used:', (usage.storage?.used / 1024 / 1024).toFixed(2), 'MB');
      console.log('');
    } catch (usageError) {
      console.log('ℹ️  Could not fetch usage info (requires higher permissions)');
      console.log('');
    }

    // Test upload folders
    console.log('📁 Checking/Creating upload folders...');
    console.log('  ✓ Folders will be created automatically on first upload');
    console.log('    - matchbox/profiles (for profile pictures)');
    console.log('    - matchbox/resumes (for resume files)');
    console.log('');

    console.log('🎉 All checks passed! Your Cloudinary setup is ready to use.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart your backend server (npm run dev)');
    console.log('  2. Try the signup flow with file uploads');
    console.log('  3. Check your Cloudinary dashboard: https://cloudinary.com/console');

  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Cloudinary\n');
    console.error('Error details:', error.message);
    console.error('');

    if (error.message.includes('Invalid')) {
      console.error('💡 Possible issues:');
      console.error('  - Check if your Cloud Name is correct');
      console.error('  - Check if your API Key is correct');
      console.error('  - Check if your API Secret is correct');
      console.error('  - Make sure there are no extra spaces in .env file');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.error('💡 Network issue detected:');
      console.error('  - Check your internet connection');
      console.error('  - Check if you can access cloudinary.com in browser');
    } else {
      console.error('💡 Check your credentials in the .env file');
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
