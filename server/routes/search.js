const express = require('express');
const { algoliasearch } = require('algoliasearch');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize Algolia Search client (for searching only, using Search API Key)
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_SEARCH_API_KEY
);

/**
 * @route   POST /api/search
 * @desc    Search across users and projects using Algolia
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { query, type = 'all' } = req.body;

    const requests = [];
    
    if (type === 'all' || type === 'users') {
      requests.push({
        indexName: 'users',
        query: query,
        hitsPerPage: 10
      });
    }

    if (type === 'all' || type === 'projects') {
      requests.push({
        indexName: 'projects',
        query: query,
        hitsPerPage: 10
      });
    }

    const { results } = await client.search({
      requests: requests
    });
    
    res.json({
      success: true,
      users: results.find(r => r.index === 'users')?.hits || [],
      projects: results.find(r => r.index === 'projects')?.hits || []
    });
  } catch (error) {
    console.error('Algolia Search Error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;
