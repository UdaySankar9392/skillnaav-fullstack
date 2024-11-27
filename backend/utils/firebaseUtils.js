const admin = require('../config/firebase'); // Import the Firebase instance initialized in your config

/**
 * Verifies the Firebase ID token.
 * @param {string} idToken - The ID token from Firebase client.
 * @returns {Promise<Object>} - The decoded token information.
 * @throws {Error} - If token verification fails.
 */
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Unauthorized');
  }
};

module.exports = { verifyIdToken };
