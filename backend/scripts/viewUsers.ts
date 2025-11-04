import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const viewUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchbox';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all users (exclude password field)
    const users = await User.find().select('-password');

    console.log(`📊 Total Users: ${users.length}\n`);
    console.log('=' . repeat(80));

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      if (user.preferredName) console.log(`   Preferred Name: ${user.preferredName}`);
      console.log(`   University: ${user.university}`);
      console.log(`   Major: ${user.major}`);
      if (user.graduationYear) console.log(`   Graduation Year: ${user.graduationYear}`);
      console.log(`   Alumni: ${user.isAlumni ? 'Yes' : 'No'}`);
      if (user.bio) console.log(`   Bio: ${user.bio.substring(0, 100)}${user.bio.length > 100 ? '...' : ''}`);
      if (user.profilePicture) console.log(`   Profile Picture: ${user.profilePicture}`);

      // Professional Links
      if (user.professionalLinks) {
        console.log(`   Professional Links:`);
        if (user.professionalLinks.linkedin) console.log(`     - LinkedIn: ${user.professionalLinks.linkedin}`);
        if (user.professionalLinks.github) console.log(`     - GitHub: ${user.professionalLinks.github}`);
        if (user.professionalLinks.portfolio) console.log(`     - Portfolio: ${user.professionalLinks.portfolio}`);
      }

      // Skills
      if (user.skills) {
        const skillsList = Object.entries(user.skills).filter(([_, level]) => level > 0);
        if (skillsList.length > 0) {
          console.log(`   Skills: ${skillsList.map(([skill, level]) => `${skill} (${level}/10)`).join(', ')}`);
        }
      }

      // Interests
      if (user.interests && user.interests.length > 0) {
        console.log(`   Interests: ${user.interests.join(', ')}`);
      }

      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log('-'.repeat(80));
    });

    console.log(`\n✅ Found ${users.length} user(s)\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

viewUsers();
