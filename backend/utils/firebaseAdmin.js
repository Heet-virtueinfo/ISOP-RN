const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const jsonStr = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64',
    ).toString('utf-8');
    serviceAccount = JSON.parse(jsonStr);
  } catch (error) {
    console.error(
      'Firebase Admin Error: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64.',
      error.message,
    );
  }
}

// 1. Validation: Ensure service account is loaded
if (!serviceAccount) {
  throw new Error(
    'Firebase Admin Error: Service account credentials missing. Please set FIREBASE_SERVICE_ACCOUNT_BASE64.',
  );
}

// 2. Validation: Ensure essential fields are present
const requiredFields = ['project_id', 'client_email', 'private_key'];
const missingFields = requiredFields.filter(field => !serviceAccount[field]);

if (missingFields.length > 0) {
  throw new Error(
    `Firebase Admin Error: Service account is missing required fields: ${missingFields.join(
      ', ',
    )}`,
  );
}

// 3. Sanitization: Fix common private key formatting issues
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// 4. Singleton Pattern: Prevent multiple initializations
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.info('Firebase Admin: Initialized successfully.');
  } catch (error) {
    console.error(
      'Firebase Admin Error: Initialization failed.',
      error.message,
    );
    throw error;
  }
}

const db = admin.firestore();
const messaging = admin.messaging();

module.exports = { admin, db, messaging };
