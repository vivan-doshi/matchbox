import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const verifyExistingUsers = async () => {
  // Check for dry-run flag
  const isDryRun = process.argv.includes('--dry-run');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchbox';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    } else {
      console.log('⚠️  LIVE MODE - Changes will be applied to database\n');
    }

    // Find all existing users who need verification
    // These are users who:
    // 1. Have @usc.edu email (enforced by schema)
    // 2. Are not yet verified (emailVerified: false)
    // This will verify ALL unverified users, including those waiting for email verification
    const query = {
      email: /@usc\.edu$/,
      emailVerified: false,
      uscIdVerified: false
    };

    const usersToVerify = await User.find(query).select('-password');

    console.log('=' . repeat(80));
    console.log(`📊 Found ${usersToVerify.length} existing user(s) to auto-verify\n`);

    if (usersToVerify.length === 0) {
      console.log('✅ No users need verification. All existing users are already verified!\n');
      return;
    }

    console.log('Users to be verified:');
    console.log('-'.repeat(80));

    usersToVerify.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Signed up: ${user.createdAt}`);
      console.log(`   Current status: emailVerified=${user.emailVerified}, uscIdVerified=${user.uscIdVerified}`);
      console.log('-'.repeat(80));
    });

    if (isDryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No changes were made');
      console.log('To apply these changes, run without --dry-run flag:\n');
      console.log('   npm run migrate:verify-users\n');
      return;
    }

    // Confirm before proceeding
    console.log('\n⚠️  About to update these users in the database...');
    console.log('Press Ctrl+C within 5 seconds to cancel\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Perform the migration
    const now = new Date();
    const updateResult = await User.updateMany(
      query,
      {
        $set: {
          emailVerified: true,
          uscIdVerified: true,
          uscIdVerifiedAt: now
        }
      }
    );

    console.log('=' . repeat(80));
    console.log('✅ MIGRATION COMPLETE\n');
    console.log(`📊 Results:`);
    console.log(`   Matched: ${updateResult.matchedCount} user(s)`);
    console.log(`   Modified: ${updateResult.modifiedCount} user(s)`);
    console.log(`   Timestamp: ${now.toISOString()}\n`);

    // Verify the updates
    const verifiedUsers = await User.find({
      _id: { $in: usersToVerify.map(u => u._id) }
    }).select('email emailVerified uscIdVerified uscIdVerifiedAt');

    console.log('Verification Status After Migration:');
    console.log('-'.repeat(80));
    verifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ✓ emailVerified: ${user.emailVerified}`);
      console.log(`   ✓ uscIdVerified: ${user.uscIdVerified}`);
      console.log(`   ✓ uscIdVerifiedAt: ${user.uscIdVerifiedAt}`);
      console.log('-'.repeat(80));
    });

    console.log('\n✅ All existing users have been auto-verified!');
    console.log('They can now access competitions and all platform features.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

verifyExistingUsers();
