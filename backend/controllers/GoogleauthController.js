const { verifyIdToken } = require('../utils/firebaseUtils'); // Import the token verification utility
const UserGoogleModel = require('../models/UserGooglemodel');

// Function to handle Google login
const googleLogin = async (req, res) => {
  const { idToken } = req.body; // Get the ID token from the client

  try {
    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const { email, name } = decodedToken; // Extract user details from the token

    // Check if the user already exists
    let user = await UserGoogleModel.findOne({ email });

    if (!user) {
      // Create a new user with basic Google details
      user = new UserGoogleModel({
        email,
        name,
        googleAuth: true,
        // Additional fields will be filled later
        universityName: '',
        dob: null,
        educationLevel: '',
        fieldOfStudy: '',
        desiredField: '',
        linkedin: '',
        portfolio: '',
      });

      await user.save();

      return res.status(200).json({
        message: 'User authenticated, please complete your profile.',
        user,
        redirectTo: '/user-profile-form', // Indicate where the frontend should redirect
      });
    }

    // If user exists but the profile isn't completed
    if (!user.universityName || !user.educationLevel) {
      return res.status(200).json({
        message: 'Welcome back! Please complete your profile.',
        user,
        redirectTo: '/user-profile-form', // Redirect for profile completion
      });
    }

    // If the user profile is complete, redirect to the dashboard or another page
    res.status(200).json({
      message: 'Welcome back!',
      user,
      redirectTo: '/dashboard', // Example: redirect to the main dashboard
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    res.status(401).send('Authentication failed');
  }
};

module.exports = { googleLogin };
