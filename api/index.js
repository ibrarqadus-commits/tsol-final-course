// Vercel serverless function entry point
// This file wraps the Express app for Vercel deployment

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

const app = require('../server');

// Export the Express app directly for Vercel
module.exports = app;

