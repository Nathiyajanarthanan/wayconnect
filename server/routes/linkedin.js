const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/auth/linkedin/callback',
  scope: 'r_liteprofile r_emailaddress w_member_social'
};

// Generate LinkedIn OAuth URL
router.get('/auth-url', (req, res) => {
  // Check if LinkedIn credentials are configured
  if (!LINKEDIN_CONFIG.clientId || LINKEDIN_CONFIG.clientId === 'undefined') {
    return res.status(400).json({ 
      error: 'LinkedIn integration not configured',
      message: 'LinkedIn OAuth credentials are not set up. Please configure LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your environment variables.'
    });
  }

  const state = Math.random().toString(36).substring(7);
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(LINKEDIN_CONFIG.redirectUri)}&` +
    `state=${state}&` +
    `scope=${encodeURIComponent(LINKEDIN_CONFIG.scope)}`;
  
  res.json({ authUrl, state });
});

// Handle LinkedIn OAuth callback
router.post('/callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code,
      redirect_uri: LINKEDIN_CONFIG.redirectUri,
      client_id: LINKEDIN_CONFIG.clientId,
      client_secret: LINKEDIN_CONFIG.clientSecret
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenResponse.data;

    // Get LinkedIn profile data
    const [profileResponse, emailResponse] = await Promise.all([
      axios.get('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,headline,summary,positions,educations,skills,profilePicture(displayImage~:playableStreams))', {
        headers: { Authorization: `Bearer ${access_token}` }
      }),
      axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${access_token}` }
      })
    ]);

    const linkedinProfile = profileResponse.data;
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    res.json({
      success: true,
      linkedinData: {
        linkedinId: linkedinProfile.id,
        email,
        firstName: linkedinProfile.firstName?.localized?.en_US,
        lastName: linkedinProfile.lastName?.localized?.en_US,
        headline: linkedinProfile.headline?.localized?.en_US,
        summary: linkedinProfile.summary?.localized?.en_US,
        profilePicture: linkedinProfile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        positions: linkedinProfile.positions?.values || [],
        educations: linkedinProfile.educations?.values || [],
        skills: linkedinProfile.skills?.values || [],
        accessToken: access_token
      }
    });
  } catch (error) {
    console.error('LinkedIn OAuth error:', error.response?.data || error.message);
    res.status(400).json({ 
      success: false, 
      error: 'LinkedIn authentication failed',
      details: error.response?.data || error.message 
    });
  }
});

// Import LinkedIn connections
router.post('/import-connections', auth, async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    // Get LinkedIn connections
    const connectionsResponse = await axios.get('https://api.linkedin.com/v2/connections?q=viewer&projection=(elements*(to~(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams))))', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const linkedinConnections = connectionsResponse.data.elements || [];
    const importedConnections = [];

    for (const connection of linkedinConnections) {
      const connectionProfile = connection['to~'];
      
      // Check if user already exists in our database
      let existingUser = await User.findOne({ 
        'linkedinData.linkedinId': connectionProfile.id 
      });

      if (!existingUser) {
        // Create a new user profile from LinkedIn data
        existingUser = new User({
          email: `linkedin_${connectionProfile.id}@wayconnect.temp`,
          password: 'linkedin_import_temp',
          userType: 'employee',
          profile: {
            firstName: connectionProfile.firstName?.localized?.en_US,
            lastName: connectionProfile.lastName?.localized?.en_US,
            headline: connectionProfile.headline?.localized?.en_US,
            profilePicture: connectionProfile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier
          },
          linkedinData: {
            linkedinId: connectionProfile.id,
            imported: true
          }
        });
        await existingUser.save();
      }

      importedConnections.push(existingUser);
    }

    res.json({
      success: true,
      imported: importedConnections.length,
      connections: importedConnections
    });
  } catch (error) {
    console.error('Import connections error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to import LinkedIn connections' 
    });
  }
});

// Search LinkedIn profiles
router.post('/search-linkedin', auth, async (req, res) => {
  try {
    const { query, accessToken } = req.body;
    
    // Search LinkedIn profiles (Note: This requires LinkedIn Partner Program access)
    const searchResponse = await axios.get(`https://api.linkedin.com/v2/people-search?keywords=${encodeURIComponent(query)}&projection=(elements*(id,firstName,lastName,headline,profilePicture(displayImage~:playableStreams)))`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const searchResults = searchResponse.data.elements || [];
    
    res.json({
      success: true,
      results: searchResults.map(profile => ({
        linkedinId: profile.id,
        name: `${profile.firstName?.localized?.en_US || ''} ${profile.lastName?.localized?.en_US || ''}`.trim(),
        headline: profile.headline?.localized?.en_US,
        profilePicture: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier
      }))
    });
  } catch (error) {
    console.error('LinkedIn search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'LinkedIn search failed. This feature requires LinkedIn Partner Program access.' 
    });
  }
});

module.exports = router;