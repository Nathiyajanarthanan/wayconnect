const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');
require('dotenv').config();

async function checkRealData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get your main account
    const mainUser = await User.findOne({ email: 'nathiyaj2006@gmail.com' })
      .populate('followers following', 'email profile.firstName profile.lastName profile.companyName');
    
    if (mainUser) {
      console.log('\n=== YOUR ACCOUNT ANALYSIS ===');
      console.log(`Name: ${mainUser.profile.firstName} ${mainUser.profile.lastName}`);
      console.log(`Email: ${mainUser.email}`);
      console.log(`Type: ${mainUser.userType}`);
      
      console.log('\n--- PEOPLE FOLLOWING YOU ---');
      mainUser.followers.forEach(follower => {
        const name = follower.profile?.firstName ? 
          `${follower.profile.firstName} ${follower.profile.lastName}` : 
          follower.profile?.companyName || 'Unknown';
        console.log(`- ${name} (${follower.email})`);
      });
      
      console.log('\n--- PEOPLE YOU ARE FOLLOWING ---');
      mainUser.following.forEach(following => {
        const name = following.profile?.firstName ? 
          `${following.profile.firstName} ${following.profile.lastName}` : 
          following.profile?.companyName || 'Unknown';
        console.log(`- ${name} (${following.email})`);
      });
    }
    
    // Check real messages
    const messages = await Message.find({})
      .populate('sender receiver', 'email profile.firstName profile.lastName profile.companyName')
      .sort({ createdAt: -1 });
    
    console.log(`\n=== REAL MESSAGES ===`);
    console.log(`Total messages in database: ${messages.length}`);
    
    if (messages.length > 0) {
      console.log('\nRecent messages:');
      messages.slice(0, 5).forEach(msg => {
        const senderName = msg.sender?.profile?.firstName ? 
          `${msg.sender.profile.firstName} ${msg.sender.profile.lastName}` : 
          msg.sender?.profile?.companyName || 'Unknown';
        const receiverName = msg.receiver?.profile?.firstName ? 
          `${msg.receiver.profile.firstName} ${msg.receiver.profile.lastName}` : 
          msg.receiver?.profile?.companyName || 'Unknown';
        
        console.log(`- ${senderName} → ${receiverName}: "${msg.content}" (${msg.createdAt})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRealData();