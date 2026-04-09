const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('Fetching conversations for user:', req.user._id);
    
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
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
              { $eq: ['$sender', req.user._id] },
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
                    { $eq: ['$receiver', req.user._id] },
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

    // Populate user details
    await Message.populate(conversations, {
      path: '_id lastMessage.sender lastMessage.receiver',
      select: 'profile.firstName profile.lastName profile.companyName profile.profilePicture userType'
    });

    console.log('Found conversations:', conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    console.log('Fetching messages between:', req.user._id, 'and', req.params.userId);
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender receiver', 'profile.firstName profile.lastName profile.companyName userType')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    console.log('Found messages:', messages.length);
    res.json(messages);
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiver, content, messageType = 'text' } = req.body;
    console.log('Sending message from:', req.user._id, 'to:', receiver);

    const message = new Message({
      sender: req.user._id,
      receiver,
      content,
      messageType
    });

    await message.save();
    await message.populate('sender receiver', 'profile.firstName profile.lastName profile.companyName userType');

    console.log('Message saved successfully:', message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send voice message
router.post('/send-voice', auth, upload.single('audio'), async (req, res) => {
  try {
    const { receiver } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    console.log('Sending voice message from:', req.user._id, 'to:', receiver);

    const message = new Message({
      sender: req.user._id,
      receiver,
      content: 'Voice message',
      messageType: 'voice',
      fileUrl: `/uploads/${req.file.filename}`
    });

    await message.save();
    await message.populate('sender receiver', 'profile.firstName profile.lastName profile.companyName userType');

    console.log('Voice message saved successfully:', message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send voice message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;