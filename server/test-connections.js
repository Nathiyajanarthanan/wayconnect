const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testConnections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('email profile.firstName profile.lastName following followers');
    console.log('\n=== ALL USERS ===');
    users.forEach(user => {
      console.log(`${user.email} - Following: ${user.following.length}, Followers: ${user.followers.length}`);
    });

    // Test connections for first user
    if (users.length > 0) {
      const firstUser = users[0];
      console.log(`\n=== TESTING CONNECTIONS FOR ${firstUser.email} ===`);
      
      const userWithConnections = await User.findById(firstUser._id)
        .populate('following', 'email profile.firstName profile.lastName');
      
      console.log('Following:', userWithConnections.following.map(u => u.email));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testConnections();