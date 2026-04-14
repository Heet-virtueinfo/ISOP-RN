const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

if (!process.env.BREVO_API_KEY) {
  console.warn(
    'Email Warning: BREVO_API_KEY not set. Email sending will be disabled.',
  );
}

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

module.exports = brevo;
