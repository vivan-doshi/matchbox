import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const forceVerifyAll = async () => {
  // Check for dry-run flag
  const isDryRun = process.argv.includes('--dry-run');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchbox';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.name}\n`);

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    } else {
      console.log('⚠️  LIVE MODE - Changes will be applied to database\n');
    }

    // Find ALL users with @usc.edu email (simplified query)
    const allUsers = await User.find({
      email: { $regex: /@usc\.edu$/i }
    }).select('email firstName lastName emailVerified uscIdVerified createdAt');

    console.log('='.repeat(80));
    console.log(`📊 Found ${allUsers.length} user(s) with @usc.edu email\n`);

    if (allUsers.length === 0) {
      console.log('❌ No @usc.edu users found in database');
      return;
    }

    // Separate verified and unverified
    const unverifiedUsers = allUsers.filter(u => !u.emailVerified || !u.uscIdVerified);
    const alreadyVerified = allUsers.filter(u => u.emailVerified && u.uscIdVerified);

    console.log(`✅ Already verified: ${alreadyVerified.length}`);
    console.log(`❌ Need verification: ${unverifiedUsers.length}\n`);

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!');
      return;
    }

    console.log('Users to be verified:');
    console.log('-'.repeat(80));

    unverifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Current: emailVerified=${user.emailVerified}, uscIdVerified=${user.uscIdVerified}`);
      console.log(`   Signed up: ${user.createdAt}`);
      console.log('-'.repeat(80));
    });

    if (isDryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes were made');
      console.log('To apply these changes, run without --dry-run flag:\n');
      console.log('   npx ts-node scripts/forceVerifyAll.ts\n');
      return;
    }

    // Confirm before proceeding
    console.log('\n⚠️  About to verify these users in the database...');
    console.log('Press Ctrl+C within 5 seconds to cancel\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform the update using direct MongoDB updateMany
    const now = new Date();
    const result = await User.updateMany(
      {
        email: { $regex: /@usc\.edu$/i },
        $or: [
          { emailVerified: false },
          { emailVerified: { $exists: false } },
          { uscIdVerified: false },
          { uscIdVerified: { $exists: false } }
        ]
      },
      {
        $set: {
          emailVerified: true,
          uscIdVerified: true,
          uscIdVerifiedAt: now
        }
      }
    );

    console.log('='.repeat(80));
    console.log('✅ MIGRATION COMPLETE\n');
    console.log(`📊 Results:`);
    console.log(`   Matched: ${result.matchedCount} user(s)`);
    console.log(`   Modified: ${result.modifiedCount} user(s)`);
    console.log(`   Timestamp: ${now.toISOString()}\n`);

    // Verify the updates
    const verifiedUsers = await User.find({
      email: { $regex: /@usc\.edu$/i }
    }).select('email emailVerified uscIdVerified uscIdVerifiedAt');

    console.log('Verification Status After Migration:');
    console.log('-'.repeat(80));

    const stillUnverified = verifiedUsers.filter(u => !u.emailVerified || !u.uscIdVerified);
    const nowVerified = verifiedUsers.filter(u => u.emailVerified && u.uscIdVerified);

    console.log(`✅ Verified users: ${nowVerified.length}`);
    console.log(`❌ Still unverified: ${stillUnverified.length}\n`);

    if (stillUnverified.length > 0) {
      console.log('⚠️  Warning: Some users are still unverified:');
      stillUnverified.forEach(u => {
        console.log(`   - ${u.email}: emailVerified=${u.emailVerified}, uscIdVerified=${u.uscIdVerified}`);
      });
      console.log();
    }

    console.log('\n✅ All @usc.edu users have been verified!');
    console.log('They can now login and access all platform features.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

forceVerifyAll();
