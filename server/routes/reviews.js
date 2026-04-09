const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Submit a review for a user after project completion
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { revieweeId, projectId, rating, comment } = req.body;

    // Check if project exists and is completed (ideal, but checking existence for now)
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Basic permission: Reviewer must be part of the project
    const isCompany = project.company.toString() === req.user._id.toString();
    const isFreelancer = project.selectedFreelancer?.toString() === req.user._id.toString();

    if (!isCompany && !isFreelancer) {
      return res.status(403).json({ message: 'You are not authorized to review this project' });
    }

    // Prevent reviewing yourself
    if (revieweeId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      projectId: projectId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user for this project' });
    }

    const review = new Review({
      reviewer: req.user._id,
      reviewee: revieweeId,
      projectId,
      rating,
      comment
    });

    await review.save();
    
    // Populate reviewer info for the response
    await review.populate('reviewer', 'profile.firstName profile.lastName profile.profilePicture');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/reviews/:userId
 * @desc    Get all reviews for a specific user
 * @access  Private
 */
router.get('/:userId', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'profile.firstName profile.lastName profile.profilePicture')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
