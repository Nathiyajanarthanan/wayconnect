const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testFollowData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get your main account
    const mainUser = await User.findOne({ email: 'nathiyaj2006@gmail.com' });
    
    if (mainUser) {
      console.log('\n=== YOUR ACCOUNT ===');
      console.log(`Name: ${mainUser.profile.firstName} ${mainUser.profile.lastName}`);
      console.log(`Email: ${mainUser.email}`);
      console.log(`Following count: ${mainUser.following?.length || 0}`);
      console.log(`Followers count: ${mainUser.followers?.length || 0}`);
      
      if (mainUser.following && mainUser.following.length > 0) {
        console.log('\n--- PEOPLE YOU ARE FOLLOWING ---');
        const following = await User.find({ 
          _id: { $in: mainUser.following } 
        }).select('email profile.firstName profile.lastName profile.companyName');
        
        following.forEach(user => {
          const name = user.profile?.firstName ? 
            `${user.profile.firstName} ${user.profile.lastName}` : 
            user.profile?.companyName || 'Unknown';
          console.log(`- ${name} (${user.email})`);
        });
      }
      
      if (mainUser.followers && mainUser.followers.length > 0) {
        console.log('\n--- PEOPLE FOLLOWING YOU ---');
        const followers = await User.find({ 
          _id: { $in: mainUser.followers } 
        }).select('email profile.firstName profile.lastName profile.companyName');
        
        followers.forEach(user => {
          const name = user.profile?.firstName ? 
            `${user.profile.firstName} ${user.profile.lastName}` : 
            user.profile?.companyName || 'Unknown';
          console.log(`- ${name} (${user.email})`);
        });
      }
    } else {
      console.log('Main user not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testFollowData();