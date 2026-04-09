const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Matches a user to a project based on skills and bio using AI
 * @param {Object} user - User profile data
 * @param {Object} project - Project details
 * @returns {Promise<Object>} - Match score and reasoning
 */
async function matchUserToProject(user, project) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      As an expert career counselor and recruiter, analyze the compatibility between this professional and project.
      
      PROFESSIONAL:
      Headline: ${user.profile?.headline || 'N/A'}
      Bio: ${user.profile?.bio || 'N/A'}
      Skills: ${user.profile?.skills?.join(', ') || 'N/A'}
      
      PROJECT:
      Title: ${project.title}
      Description: ${project.description}
      Requirements: ${project.requirements?.join(', ') || 'N/A'}

      Provide a match analysis in JSON format:
      {
        "score": (0-100),
        "matchReason": "Short explanation of why they are a good fit",
        "missingSkills": ["skill1", "skill2"],
        "recommendation": "Advice for the user"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from response if needed
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini Matching Error:', error);
    return { score: 0, matchReason: 'AI analysis unavailable', missingSkills: [], recommendation: '' };
  }
}

/**
 * Suggests improvements for a user's professional profile
 * @param {Object} userProfile - User profile data
 * @returns {Promise<Object>} - Suggested headline and bio
 */
async function optimizeProfile(userProfile) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Optimize the following professional profile to make it more attractive to recruiters on a freelance platform.
      
      CURRENT PROFILE:
      Headline: ${userProfile.headline || ''}
      Bio: ${userProfile.bio || ''}
      Skills: ${userProfile.skills?.join(', ') || ''}

      Provide the optimized profile in JSON format:
      {
        "suggestedHeadline": "...",
        "suggestedBio": "...",
        "improvementTips": ["tip1", "tip2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini Optimization Error:', error);
    return null;
  }
}

module.exports = {
  matchUserToProject,
  optimizeProfile
};
