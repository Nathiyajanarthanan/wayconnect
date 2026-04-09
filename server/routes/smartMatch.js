const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { matchUserToProject, optimizeProfile } = require('../utils/gemini');

const router = express.Router();

// Get smart matches based on skills
router.get('/skills', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userSkills = currentUser.profile?.skills || [];
    
    if (userSkills.length === 0) {
      return res.json([]);
    }

    // Find users with similar skills
    const matches = await User.find({
      _id: { $ne: req.user._id },
      'profile.skills': { $in: userSkills }
    })
    .select('-password')
    .limit(10);

    res.json(matches);
  } catch (error) {
    console.error('Smart match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get smart matches based on goals
router.get('/goals', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userType = currentUser.userType;
    
    // Find users with similar career goals (same user type)
    const matches = await User.find({
      _id: { $ne: req.user._id },
      userType: userType
    })
    .select('-password')
    .limit(10);

    res.json(matches);
  } catch (error) {
    console.error('Goal match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get smart matches for project collaboration
router.get('/projects', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userSkills = currentUser.profile?.skills || [];
    
    // Find users who might be good for collaboration
    const matches = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { 'profile.skills': { $in: userSkills } },
        { userType: { $ne: currentUser.userType } } // Different user types for diverse collaboration
      ]
    })
    .select('-password')
    .limit(10);

    res.json(matches);
  } catch (error) {
    console.error('Project match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Analyze match between user and a specific project
router.post('/ai-analyze', auth, async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = await Project.findById(projectId);
    const user = await User.findById(req.user._id);

    if (!project || !user) {
      return res.status(404).json({ message: 'Project or User not found' });
    }

    const analysis = await matchUserToProject(user, project);
    res.json(analysis);
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ message: 'AI Analysis failed' });
  }
});

// AI Optimize user profile
router.post('/optimize-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const optimization = await optimizeProfile(user.profile);
    
    if (!optimization) {
      return res.status(500).json({ message: 'Optimization failed' });
    }

    res.json(optimization);
  } catch (error) {
    console.error('AI Profile Optimization error:', error);
    res.status(500).json({ message: 'Profile optimization failed' });
  }
});

module.exports = router;