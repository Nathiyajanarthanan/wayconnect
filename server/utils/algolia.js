const { algoliasearch } = require('algoliasearch');

// Initialize Algolia
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_WRITE_API_KEY
);

/**
 * Syncs a user profile to Algolia
 * @param {Object} user - User document
 */
async function syncUserToAlgolia(user) {
  try {
    const record = {
      objectID: user._id.toString(),
      name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
      headline: user.profile?.headline,
      skills: user.profile?.skills,
      userType: user.userType,
      location: user.profile?.location,
      profilePicture: user.profile?.profilePicture
    };
    
    await client.saveObject({
      indexName: 'users',
      body: record
    });
  } catch (error) {
    console.error('Algolia user sync error:', error);
  }
}

/**
 * Syncs a project to Algolia
 * @param {Object} project - Project document
 */
async function syncProjectToAlgolia(project) {
  try {
    const record = {
      objectID: project._id.toString(),
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      budget: project.budget,
      status: project.status,
      companyId: project.company?.toString()
    };
    
    await client.saveObject({
      indexName: 'projects',
      body: record
    });
  } catch (error) {
    console.error('Algolia project sync error:', error);
  }
}

/**
 * Deletes a record from Algolia
 * @param {string} indexName - 'users' or 'projects'
 * @param {string} objectId - Document ID
 */
async function deleteFromAlgolia(indexName, objectId) {
  try {
    await client.deleteObject({
      indexName: indexName,
      objectID: objectId
    });
  } catch (error) {
    console.error(`Algolia delete error from ${indexName}:`, error);
  }
}

module.exports = {
  syncUserToAlgolia,
  syncProjectToAlgolia,
  deleteFromAlgolia
};
