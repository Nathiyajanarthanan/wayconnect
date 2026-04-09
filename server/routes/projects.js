const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { syncProjectToAlgolia } = require('../utils/algolia');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;

    const projects = await Project.find(query)
      .populate('company', 'profile.companyName profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project (companies only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ message: 'Only companies can create projects' });
    }

    const project = new Project({
      ...req.body,
      company: req.user._id
    });

    await project.save();
    await project.populate('company', 'profile.companyName');

    // Sync to Algolia
    syncProjectToAlgolia(project).catch(err => console.error('Algolia sync error:', err));

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to project
router.post('/:projectId/apply', auth, async (req, res) => {
  try {
    if (req.user.userType === 'company') {
      return res.status(403).json({ message: 'Companies cannot apply to projects' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if already applied
    const existingApplication = project.applications.find(
      app => app.applicant.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this project' });
    }

    project.applications.push({
      applicant: req.user._id,
      proposal: req.body.proposal,
      proposedBudget: req.body.proposedBudget
    });

    await project.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;