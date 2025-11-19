import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchbox';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    console.log(`Database: ${mongoose.connection.name}\n`);

    // Count all users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}\n`);

    if (totalUsers === 0) {
      console.log('❌ Database is empty - no users found!');
      console.log('\nThis means:');
      console.log('  - Users were created in a different database');
      console.log('  - Or this is the wrong database connection\n');
      return;
    }

    // Get verification status breakdown
    const verifiedUsers = await User.countDocuments({ emailVerified: true, uscIdVerified: true });
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    const uscUsers = await User.countDocuments({ email: /@usc\.edu$/ });

    console.log('Verification Status:');
    console.log('─'.repeat(50));
    console.log(`✅ Fully verified users: ${verifiedUsers}`);
    console.log(`❌ Unverified users: ${unverifiedUsers}`);
    console.log(`🎓 Users with @usc.edu email: ${uscUsers}`);
    console.log('─'.repeat(50));
    console.log();

    // Show sample of users
    const sampleUsers = await User.find()
      .select('email firstName lastName emailVerified uscIdVerified createdAt')
      .limit(10);

    console.log('Sample Users:');
    console.log('─'.repeat(80));
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   USC ID Verified: ${user.uscIdVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('─'.repeat(80));
    });

    // Check for users who can't login
    const problematicUsers = await User.find({
      $or: [
        { emailVerified: false },
        { uscIdVerified: false }
      ]
    }).select('email emailVerified uscIdVerified');

    if (problematicUsers.length > 0) {
      console.log('\n⚠️  Users who might have login issues:');
      console.log('─'.repeat(80));
      problematicUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Email Verified: ${user.emailVerified}`);
        console.log(`   USC ID Verified: ${user.uscIdVerified}`);
        console.log('─'.repeat(80));
      });
    } else {
      console.log('\n✅ All users are verified and should be able to login!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkUsers();
