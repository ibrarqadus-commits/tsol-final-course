// Vercel serverless function entry point
// This file wraps the Express app for Vercel deployment

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

// Import the Express app
const app = require('../server');

// Export handler function for Vercel serverless
// Vercel expects a function that receives (req, res)
module.exports = (req, res) => {
  return app(req, res);
};

