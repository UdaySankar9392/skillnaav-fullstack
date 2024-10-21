// UserCreateAccount.js
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import createAccountImage from "../../../../assets-webapp/login-image.png"; // Update the path as needed
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Ensure these are the correct imports
import { Link } from "react-router-dom";
import { account } from "../../../../appwriteConfig";
import googleIcon from "../../../../assets-webapp/Google-icon.png";
import githubIcon from "../../../../assets-webapp/github-mark-white.svg"; // Make sure to have this image
import facebookIcon from "../../../../assets-webapp/Facebook-icon.png"; // Make sure to have this image
import axios from "axios"; // For backend API call (optional)

// Validation schema for Formik
const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

const UserCreateAccount = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Function to handle manual form submission
  const handleSubmit = (values, { setSubmitting }) => {
    try {
      console.log("User Data Submitted:", values); // Log user data to console
      // Simulate successful registration
      navigate("/user-profile-form", { state: { userData: values } });

      // Store form data in localStorage (optional)
      localStorage.setItem("userInfo", JSON.stringify(values));
    } catch (error) {
      setErrorMessage("Error registering user. Please try again.");
    }
    setSubmitting(false);
  };

  // Function to handle Google Sign-Up
  const signUpWithGoogle = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        "http://localhost:3000/user-main-page", // Success redirect
        "http://localhost:3000" // Failure redirect
      );
    } catch (error) {
      setErrorMessage("Google Sign-Up failed. Please try again.");
    }
  };

  // Function to handle GitHub Sign-Up
  const signUpWithGitHub = async () => {
    try {
      await account.createOAuth2Session(
        "github",
        "http://localhost:3000/user-main-page", // Success redirect
        "http://localhost:3000" // Failure redirect
      );
    } catch (error) {
      setErrorMessage("GitHub Sign-Up failed. Please try again.");
    }
  };

  // Function to handle Facebook Sign-Up
  const signUpWithFacebook = async () => {
    try {
      await account.createOAuth2Session(
        "facebook",
        "http://localhost:3000/user-main-page", // Success redirect
        "http://localhost:3000" // Failure redirect
      );
    } catch (error) {
      setErrorMessage("Facebook Sign-Up failed. Please try again.");
    }
  };

  // Function to fetch and store user details after successful sign-up
  const fetchUserDetails = async () => {
    try {
      const user = await account.get(); // Fetch user details from Appwrite
      setUserInfo(user); // Store in state
      console.log("User Info:", user); // Log for debugging

      // Store user details locally
      localStorage.setItem("userInfo", JSON.stringify(user));

      // Optionally send user data to your backend for permanent storage
      // await axios.post("/api/storeUser", user);

      // Navigate to user dashboard or any route after sign-up
      navigate("/user-main-page");
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch user details after OAuth2 sign-up
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <img
          src={createAccountImage}
          alt="Create Account"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="flex flex-col items-center justify-center p-8 w-full lg:w-1/2 bg-white">
        <div className="w-full max-w-md flex flex-col justify-center min-h-screen lg:min-h-full">
          <h1 className="text-2xl font-semibold mb-6 text-center">
            Create an account
          </h1>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 border border-red-400 rounded">
              {errorMessage}
            </div>
          )}

          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <Field
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4">
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4 relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? (
                      <EyeIcon className="h-5 w-5 mt-4 text-gray-500" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5 mt-4 text-gray-500" />
                    )}
                  </button>

                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div className="mb-4 relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="h-5 w-5 mt-4 text-gray-500" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5 mt-4 text-gray-500" />
                    )}
                  </button>

                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-purple-${
                    isSubmitting ? "300" : "500"
                  } text-white p-3 rounded-lg hover:bg-purple-${
                    isSubmitting ? "300" : "600"
                  } mb-4`}
                >
                  Register
                </button>
              </Form>
            )}
          </Formik>

          {/* Updated Sign-Up Buttons */}
          <div className="mt-6 space-y-4">
            <button
              onClick={signUpWithGoogle}
              className="flex items-center justify-center w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              <img
                src={googleIcon}
                alt="Google Icon"
                className="w-6 h-6 mr-2"
              />
              Sign up with Google
            </button>

            <button
              onClick={signUpWithGitHub}
              className="flex items-center justify-center w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors duration-200 shadow-md"
            >
              <img
                src={githubIcon}
                alt="GitHub Icon"
                className="w-6 h-6 mr-2"
              />
              Sign up with GitHub
            </button>

          
          </div>

          <p className="text-center text-gray-500 mt-5 font-poppins font-medium text-base leading-6">
            Already have an account?{" "}
            <Link to="/user/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCreateAccount;
