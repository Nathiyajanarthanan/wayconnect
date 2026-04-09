const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's skills
router.get('/my-skills', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skills = user.profile?.skills || [];
    
    // Transform skills into detailed format
    const detailedSkills = skills.map(skill => ({
      name: skill,
      level: 'Intermediate', // Default level
      endorsements: Math.floor(Math.random() * 15), // Mock endorsements
      verified: Math.random() > 0.7, // Random verification status
      endorsers: ['Sample User 1', 'Sample User 2'] // Mock endorsers
    }));

    res.json(detailedSkills);
  } catch (error) {
    console.error('Skills fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new skill
router.post('/add', auth, async (req, res) => {
  try {
    const { skill, level } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user.profile.skills) {
      user.profile.skills = [];
    }
    
    if (!user.profile.skills.includes(skill)) {
      user.profile.skills.push(skill);
      await user.save();
    }

    const newSkill = {
      name: skill,
      level: level || 'Beginner',
      endorsements: 0,
      verified: false,
      endorsers: []
    };

    res.json(newSkill);
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending endorsement requests
router.get('/pending-endorsements', auth, async (req, res) => {
  try {
    // Mock pending endorsements for demo
    const pendingEndorsements = [
      {
        id: 1,
        requester: { 
          name: 'John Doe', 
          email: 'john@example.com' 
        },
        skill: 'React.js',
        message: 'Please endorse my React.js skills based on our recent project collaboration.'
      }
    ];

    res.json(pendingEndorsements);
  } catch (error) {
    console.error('Pending endorsements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endorse a skill
router.post('/endorse/:endorsementId', auth, async (req, res) => {
  try {
    const { endorsementId } = req.params;
    const { approve } = req.body;

    // Mock endorsement processing
    console.log(`Endorsement ${endorsementId} ${approve ? 'approved' : 'declined'} by user ${req.user._id}`);

    res.json({ message: 'Endorsement processed successfully' });
  } catch (error) {
    console.error('Endorsement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request skill verification
router.post('/request-verification', auth, async (req, res) => {
  try {
    const { skill } = req.body;
    
    // Mock verification request
    console.log(`Verification requested for skill: ${skill} by user ${req.user._id}`);

    res.json({ message: 'Verification request sent to your connections' });
  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;