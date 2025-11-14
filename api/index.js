// Vercel serverless function entry point
// This file wraps the Express app for Vercel deployment

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

// Import the Express app
const app = require('../server');

// Vercel serverless function handler
// Vercel can handle Express apps directly, but we wrap it to ensure compatibility
module.exports = app;

