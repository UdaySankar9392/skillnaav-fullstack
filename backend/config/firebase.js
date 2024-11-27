const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Use path.resolve to get the absolute path dynamically
const serviceAccountPath = path.resolve(process.env.FIREBASE_CONFIG_PATH);

// Check if the path is correct
console.log("Resolved Firebase config path:", serviceAccountPath);

// Load the service account key using the resolved absolute path
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
