const axios = require('axios');

/**
 * Fetches user profile and repositories from GitHub
 * @param {string} username - GitHub username
 * @returns {Promise<Object>} - Formatted GitHub profile data
 */
async function fetchGithubProfile(username) {
  try {
    const config = {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`
      }
    };

    // Get user data
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, config);
    const user = userResponse.data;

    // Get repositories
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, config);
    const repos = reposResponse.data.map(repo => ({
      title: repo.name,
      description: repo.description,
      url: repo.html_url,
      technologies: [repo.language].filter(Boolean)
    }));

    return {
      bio: user.bio,
      location: user.location,
      githubUrl: user.html_url,
      avatarUrl: user.avatar_url,
      repos: repos
    };
  } catch (error) {
    console.error('GitHub fetch error:', error.response?.data || error.message);
    throw new Error('Could not fetch GitHub profile');
  }
}

module.exports = {
  fetchGithubProfile
};
