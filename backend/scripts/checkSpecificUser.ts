import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const checkSpecificUser = async () => {
  try {
    const emailToCheck = process.argv[2];

    if (!emailToCheck) {
      console.log('Usage: npx ts-node scripts/checkSpecificUser.ts <email>');
      console.log('Example: npx ts-node scripts/checkSpecificUser.ts rrsingh@usc.edu');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchbox';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.name}\n`);

    // Find user
    const user = await User.findOne({ email: emailToCheck.toLowerCase() })
      .select('email firstName lastName emailVerified uscIdVerified password createdAt');

    if (!user) {
      console.log(`❌ User not found: ${emailToCheck}`);
      console.log('\nPossible reasons:');
      console.log('  - Email is misspelled');
      console.log('  - User is in a different database');
      console.log('  - User was never created\n');
      return;
    }

    console.log('✅ User Found!\n');
    console.log('='.repeat(80));
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email Verified: ${user.emailVerified}`);
    console.log(`USC ID Verified: ${user.uscIdVerified}`);
    console.log(`Has Password: ${!!user.password}`);
    console.log(`Password Hash (first 20 chars): ${user.password?.substring(0, 20)}...`);
    console.log(`Created: ${user.createdAt}`);
    console.log('='.repeat(80));

    if (!user.password) {
      console.log('\n⚠️  WARNING: User has no password set!');
      console.log('This will cause login to fail.');
    }

    if (!user.emailVerified) {
      console.log('\n⚠️  User is NOT email verified');
    }

    if (!user.uscIdVerified) {
      console.log('\n⚠️  User is NOT USC ID verified');
    }

    console.log('\n✅ User exists and can attempt login');
    console.log('If login still fails, the password is incorrect.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkSpecificUser();
