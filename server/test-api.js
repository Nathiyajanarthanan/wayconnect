const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the main user
    const user = await User.findOne({ email: 'nathiyaj2006@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`\n=== TESTING FOR USER: ${user.email} ===`);
    console.log(`User ID: ${user._id}`);

    // Test connections endpoint logic
    const userWithConnections = await User.findById(user._id)
      .populate('following', '-password');
    
    console.log(`\nConnections found: ${userWithConnections.following.length}`);
    userWithConnections.following.forEach((connection, index) => {
      console.log(`${index + 1}. ${connection.email} - ${connection.profile?.firstName} ${connection.profile?.lastName}`);
    });

    // Test conversations
    const Message = require('./models/Message');
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: user._id },
            { receiver: user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    console.log(`\nConversations found: ${conversations.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAPI();