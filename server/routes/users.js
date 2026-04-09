const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const localUpload = require('../middleware/upload');
const { upload: cloudinaryUpload } = require('../utils/cloudinary');
const { syncUserToAlgolia } = require('../utils/algolia');
const { fetchGithubProfile } = require('../utils/github');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers following', 'profile.firstName profile.lastName profile.companyName');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/profile', auth, [
  body('firstName').optional().isString().trim(),
  body('lastName').optional().isString().trim(),
  body('companyName').optional().isString().trim(),
  body('headline').optional().isString().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Profile update request:', req.body);
    
    // Explicitly whitelist fields to prevent injection of unallowed profile properties
    const allowedFields = ['firstName', 'lastName', 'companyName', 'headline', 'bio', 'location', 'skills', 'experience', 'education'];
    const sanitizedBody = Object.keys(req.body).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Get current user to merge with existing profile
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Merge existing profile with new data
    const updatedProfile = { ...currentUser.profile.toObject(), ...sanitizedBody };
    
    console.log('Updated profile data:', updatedProfile);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile: updatedProfile } },
      { new: true }
    ).select('-password');
    
    // Sync to Algolia
    if (user) {
      syncUserToAlgolia(user).catch(err => console.error('Algolia sync error:', err));
    }
    
    console.log('Profile updated successfully');
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    next(error); // Pass to global error handler
  }
});

// Upload profile picture (Cloudinary)
router.post('/upload/profile-picture', auth, cloudinaryUpload.single('profile-picture'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the full URL in path
    const imageUrl = req.file.path;
    console.log('Cloudinary image URL:', imageUrl);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.profilePicture': imageUrl } },
      { new: true }
    ).select('-password');

    // Sync to Algolia
    if (user) {
      syncUserToAlgolia(user).catch(err => console.error('Algolia sync error:', err));
    }

    console.log('User updated successfully');

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl,
      user 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload cover photo (Cloudinary)
router.post('/upload/cover-photo', auth, cloudinaryUpload.single('cover-photo'), async (req, res) => {
  try {
    console.log('Cover upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = req.file.path;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.coverPhoto': imageUrl } },
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Cover photo uploaded successfully',
      coverPhoto: imageUrl,
      user 
    });
  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID (for viewing other profiles)
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers following', 'profile.firstName profile.lastName profile.companyName profile.profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      $or: [
        { 'profile.firstName': { $regex: query, $options: 'i' } },
        { 'profile.lastName': { $regex: query, $options: 'i' } },
        { 'profile.companyName': { $regex: query, $options: 'i' } },
        { 'profile.headline': { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user suggestions (people you may know)
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users that are not already followed and not the current user
    const suggestions = await User.find({
      _id: { 
        $ne: req.user._id,
        $nin: currentUser.following 
      }
    })
    .select('-password')
    .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user following (people you follow)
router.get('/following', auth, async (req, res) => {
  try {
    console.log('=== FOLLOWING ENDPOINT ===');
    console.log('User ID from token:', req.user._id);
    console.log('User email from token:', req.user.email);
    
    const currentUser = await User.findById(req.user._id)
      .populate('following', '-password');
    
    console.log('User found:', currentUser ? 'Yes' : 'No');
    if (currentUser) {
      console.log('User email from DB:', currentUser.email);
      console.log('Following count:', currentUser.following?.length || 0);
      console.log('Following IDs:', currentUser.following?.map(f => f._id) || []);
    }
    
    const following = currentUser.following || [];
    console.log('Returning following:', following.length);
    
    res.json(following);
  } catch (error) {
    console.error('Following error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    console.log('=== FOLLOW ENDPOINT ===');
    console.log('Current user ID:', req.user._id);
    console.log('Target user ID:', req.params.userId);
    
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(req.params.userId);
    console.log('Currently following:', isFollowing);
    console.log('Current user following before:', currentUser.following.length);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(req.params.userId);
      userToFollow.followers.pull(req.user._id);
      console.log('Unfollowed user');
    } else {
      // Follow
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user._id);
      console.log('Followed user');
    }

    await currentUser.save();
    await userToFollow.save();
    
    console.log('Current user following after:', currentUser.following.length);
    console.log('Target user followers after:', userToFollow.followers.length);

    res.json({ 
      isFollowing: !isFollowing,
      message: isFollowing ? 'Unfollowed successfully' : 'Following successfully'
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GitHub Sync
router.post('/github/sync', auth, async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    const githubData = await fetchGithubProfile(githubUsername);
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile with GitHub data
    user.profile.github = githubData.githubUrl;
    user.profile.bio = githubData.bio || user.profile.bio;
    user.profile.location = githubData.location || user.profile.location;
    
    // Append GitHub repos to user projects
    if (githubData.repos && githubData.repos.length > 0) {
      // Avoid duplicate projects from GitHub
      const existingProjectUrls = user.profile.projects?.map(p => p.url) || [];
      const newProjects = githubData.repos.filter(repo => !existingProjectUrls.includes(repo.url));
      
      if (!user.profile.projects) user.profile.projects = [];
      user.profile.projects.push(...newProjects);
    }

    await user.save();
    
    // Sync to Algolia
    syncUserToAlgolia(user).catch(err => console.error('Algolia sync error:', err));

    res.json({ message: 'GitHub profile synced successfully', profile: user.profile });
  } catch (error) {
    console.error('GitHub sync error:', error);
    res.status(500).json({ message: 'Failed to sync GitHub profile', error: error.message });
  }
});

module.exports = router;