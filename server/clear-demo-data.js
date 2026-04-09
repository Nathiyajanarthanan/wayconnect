const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearDemoData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Remove only the demo users we created
    const demoEmails = [
      'john.doe@example.com',
      'sarah.wilson@example.com', 
      'techcorp@example.com',
      'mike.chen@example.com',
      'emma.garcia@example.com'
    ];
    
    const result = await User.deleteMany({ 
      email: { $in: demoEmails }
    });
    
    console.log(`Removed ${result.deletedCount} demo users`);
    
    // Show remaining real users
    const realUsers = await User.find({}).select('email profile.firstName profile.lastName profile.companyName userType followers following createdAt');
    console.log(`\nReal users in database: ${realUsers.length}`);
    
    realUsers.forEach(user => {
      const name = user.profile?.firstName ? 
        `${user.profile.firstName} ${user.profile.lastName}` : 
        user.profile?.companyName || 'Unknown';
      console.log(`- ${name} (${user.email}) - ${user.userType} - Followers: ${user.followers.length}, Following: ${user.following.length}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearDemoData();