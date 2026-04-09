require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { algoliasearch } = require('algoliasearch');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const axios = require('axios');

async function runDiagnostics() {
  console.log('🚀 Starting WayConnectX System Diagnostics...\n');
  const results = [];

  // 1. Health Check (Server status)
  try {
    const health = await axios.get('http://localhost:5000/health');
    results.push({ name: 'Server Health Check', status: '✅ SUCCESS', details: `Uptime: ${health.data.status}` });
  } catch (err) {
    results.push({ name: 'Server Health Check', status: '❌ FAILED', details: 'Server not running on port 5000' });
  }

  // 2. Gemini AI
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    await model.generateContent('ping');
    results.push({ name: 'Gemini AI API', status: '✅ SUCCESS', details: 'AI is responding' });
  } catch (err) {
    results.push({ name: 'Gemini AI API', status: '❌ FAILED', details: err.message });
  }

  // 3. Algolia Search
  try {
    const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_API_KEY);
    await client.search({ requests: [{ indexName: 'users', query: '' }] });
    results.push({ name: 'Algolia Search API', status: '✅ SUCCESS', details: 'Search index is reachable' });
  } catch (err) {
    results.push({ name: 'Algolia Search API', status: '❌ FAILED', details: err.message });
  }

  // 4. Cloudinary
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    const cloudInfo = await cloudinary.api.ping();
    results.push({ name: 'Cloudinary Storage', status: '✅ SUCCESS', details: 'Cloud storage is connected' });
  } catch (err) {
    results.push({ name: 'Cloudinary Storage', status: '❌ FAILED', details: err.message });
  }

  // 5. Resend Email
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data } = await resend.apiKeys.list();
    results.push({ name: 'Resend Email API', status: '✅ SUCCESS', details: 'Email service is authenticated' });
  } catch (err) {
    results.push({ name: 'Resend Email API', status: '❌ FAILED', details: err.message });
  }

  // 6. GitHub API
  try {
    await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    });
    results.push({ name: 'GitHub Token', status: '✅ SUCCESS', details: 'Token is valid' });
  } catch (err) {
    results.push({ name: 'GitHub Token', status: '❌ FAILED', details: 'Token invalid or expired' });
  }

  console.table(results);
  
  const allSuccess = results.every(r => r.status.includes('SUCCESS'));
  if (allSuccess) {
    console.log('\n🎉 ALL SYSTEMS GO! WayConnectX is ready for deployment.');
  } else {
    console.log('\n⚠️ SOME ISSUES FOUND. Please check the details above.');
  }
}

runDiagnostics();
