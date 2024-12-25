const jwt = require('jsonwebtoken');
const axios = require('axios');

// URL for Firebase public keys
const firebasePublicKeysUrl = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

// Cache to store the public keys
let publicKeys = null;
const CACHE_EXPIRATION_TIME = 3600000; // 1 hour
let lastFetchTime = Date.now();

// Function to fetch Firebase public keys
async function fetchFirebasePublicKeys() {
  if (!publicKeys || (Date.now() - lastFetchTime > CACHE_EXPIRATION_TIME)) {
    const response = await axios.get(firebasePublicKeysUrl);
    publicKeys = response.data;
    lastFetchTime = Date.now();
  }
  return publicKeys;
}

// Function to verify the Firebase token
async function verifyToken(idToken) {
  try {
    if (!idToken || idToken.split('.').length !== 3) {
      throw new Error('Invalid JWT format.');
    }

    // Decode the JWT to get the key ID (kid) from the header
    const decodedJwt = jwt.decode(idToken, { complete: true });
    const keyId = decodedJwt.header.kid;

    // Fetch the public keys and get the corresponding public key
    const keys = await fetchFirebasePublicKeys();
    const publicKey = keys[keyId];
    if (!publicKey) {
      throw new Error('Unable to find the public key for the given token.');
    }

    // Verify the token using the RS256 algorithm and the fetched public key
    const verifiedToken = jwt.verify(idToken, publicKey, { algorithms: ['RS256'] });

    // Return the verified token
    return verifiedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

module.exports = { verifyToken };
