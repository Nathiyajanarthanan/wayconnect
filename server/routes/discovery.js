const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Global user suggestions based on various APIs
router.get('/global-suggestions', auth, async (req, res) => {
  try {
    const { skills, location, industry } = req.query;
    const suggestions = [];

    // 1. Get suggestions from our database
    const localUsers = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { 'profile.skills': { $in: skills?.split(',') || [] } },
        { 'profile.location': new RegExp(location || '', 'i') },
        { 'profile.headline': new RegExp(industry || '', 'i') }
      ]
    }).limit(10).select('-password');

    suggestions.push(...localUsers.map(user => ({
      source: 'wayconnect',
      id: user._id,
      name: user.userType === 'company' ? user.profile?.companyName : `${user.profile?.firstName} ${user.profile?.lastName}`,
      headline: user.profile?.headline,
      location: user.profile?.location,
      profilePicture: user.profile?.profilePicture,
      skills: user.profile?.skills,
      isLocal: true
    })));

    // 2. GitHub users (if skills include programming)
    if (skills?.includes('programming') || skills?.includes('developer')) {
      try {
        const githubResponse = await axios.get(`https://api.github.com/search/users?q=location:${location || 'worldwide'}+type:user&per_page=5`);
        const githubUsers = githubResponse.data.items || [];

        for (const githubUser of githubUsers) {
          const userDetails = await axios.get(githubUser.url);
          suggestions.push({
            source: 'github',
            id: githubUser.id,
            name: userDetails.data.name || githubUser.login,
            headline: userDetails.data.bio || 'Developer',
            location: userDetails.data.location,
            profilePicture: githubUser.avatar_url,
            githubUrl: githubUser.html_url,
            isLocal: false
          });
        }
      } catch (error) {
        console.log('GitHub API error:', error.message);
      }
    }

    // 3. Mock global professionals (simulating real API integrations)
    const mockGlobalUsers = [
      {
        source: 'global',
        id: 'global_1',
        name: 'Alex Rodriguez',
        headline: 'Senior Software Engineer at Google',
        location: 'Mountain View, CA',
        skills: ['React', 'Node.js', 'Python'],
        isLocal: false
      },
      {
        source: 'global',
        id: 'global_2',
        name: 'Priya Sharma',
        headline: 'Data Scientist at Microsoft',
        location: 'Bangalore, India',
        skills: ['Python', 'Machine Learning', 'SQL'],
        isLocal: false
      },
      {
        source: 'global',
        id: 'global_3',
        name: 'TechCorp Solutions',
        headline: 'Leading Software Development Company',
        location: 'London, UK',
        skills: ['Web Development', 'Mobile Apps', 'Cloud'],
        isLocal: false
      }
    ];

    suggestions.push(...mockGlobalUsers);

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 20),
      total: suggestions.length
    });
  } catch (error) {
    console.error('Global suggestions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch global suggestions' });
  }
});

// Import user from external platform
router.post('/import-external-user', auth, async (req, res) => {
  try {
    const { platform, externalId, userData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      [`${platform}Data.${platform}Id`]: externalId
    });

    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists in our platform',
        user: existingUser
      });
    }

    // Create new user from external data
    const newUser = new User({
      email: userData.email || `${platform}_${externalId}@wayconnect.temp`,
      password: `${platform}_import_temp`,
      userType: userData.userType || 'employee',
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        headline: userData.headline,
        bio: userData.bio,
        location: userData.location,
        skills: userData.skills || [],
        profilePicture: userData.profilePicture
      },
      [`${platform}Data`]: {
        [`${platform}Id`]: externalId,
        imported: true,
        importDate: new Date()
      }
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'User imported successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Import external user error:', error);
    res.status(500).json({ success: false, error: 'Failed to import user' });
  }
});

// Global project opportunities
router.get('/global-projects', auth, async (req, res) => {
  try {
    const { skills, budget, location } = req.query;
    const projects = [];

    // Mock global project opportunities (in real implementation, integrate with freelance platforms APIs)
    const mockGlobalProjects = [
      {
        id: 'freelancer_1',
        title: 'Build React Native Mobile App',
        description: 'Looking for experienced React Native developer to build cross-platform mobile application',
        budget: { min: 3000, max: 8000, currency: 'USD' },
        deadline: '2024-03-15',
        skills: ['React Native', 'JavaScript', 'Mobile Development'],
        location: 'Remote',
        platform: 'Freelancer.com',
        company: 'StartupXYZ',
        applications: 15,
        isExternal: true
      },
      {
        id: 'upwork_1',
        title: 'Data Analysis and Visualization',
        description: 'Need expert data analyst to create interactive dashboards and insights',
        budget: { min: 2000, max: 5000, currency: 'USD' },
        deadline: '2024-02-28',
        skills: ['Python', 'Data Analysis', 'Tableau'],
        location: 'Remote',
        platform: 'Upwork',
        company: 'DataCorp Inc',
        applications: 8,
        isExternal: true
      },
      {
        id: 'fiverr_1',
        title: 'Logo and Brand Identity Design',
        description: 'Creative designer needed for complete brand identity package',
        budget: { min: 500, max: 1500, currency: 'USD' },
        deadline: '2024-02-20',
        skills: ['Graphic Design', 'Branding', 'Adobe Creative Suite'],
        location: 'Remote',
        platform: 'Fiverr',
        company: 'BrandNew LLC',
        applications: 25,
        isExternal: true
      }
    ];

    projects.push(...mockGlobalProjects);

    // Filter based on user preferences
    let filteredProjects = projects;
    if (skills) {
      const userSkills = skills.split(',');
      filteredProjects = projects.filter(project => 
        project.skills.some(skill => 
          userSkills.some(userSkill => 
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        )
      );
    }

    res.json({
      success: true,
      projects: filteredProjects,
      total: filteredProjects.length
    });
  } catch (error) {
    console.error('Global projects error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch global projects' });
  }
});

module.exports = router;