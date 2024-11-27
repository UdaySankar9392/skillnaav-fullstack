import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../../../config/firebase"; // Ensure correct import of Firebase auth
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import createAccountImage from "../../../../assets-webapp/login-image.png";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

// Validation schema for Formik
const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[!@#$%^&*-_=+]/, "Password must contain at least one special character")
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
  let [googleSignup, setGoogleSignup] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Check if the user is signing up via Google (skip password validation)
      if (values.email && !values.password) {
        // Handle case where user is signing up via Google, checking for existing email
        const response = await axios.get(`/api/users/check-email?email=${values.email}`);
        if (response.data.exists) {
          setErrorMessage("Email already registered.");
          setSubmitting(false);
          return;
        }

        // Skip password validation for Google users
        navigate("/user-profile-form", {
          state: { userData: { email: values.email, name: values.name, isGoogleSignup } } // Passing only email and name
        });
      } else {
        // Regular form submission with password validation
        const response = await axios.get(`/api/users/check-email?email=${values.email}`);
        if (response.data.exists) {
          setErrorMessage("Email already registered.");
          setSubmitting(false);
          return;
        }

        // Clear any previous data in localStorage
        localStorage.removeItem("userFormData");

        // Navigate to UserProfileForm with user data
        navigate("/user-profile-form", {
          state: { userData: { ...values, name: values.name } } // Add name from the form values if available
        });
      }
    } catch (error) {
      setErrorMessage("Error checking email.");
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const displayName = user.displayName || 'No name available'; // fallback if no displayName is found
      const email = user.email;

      // Check if the email already exists in your database
      const response = await axios.get(`/api/users/check-email?email=${email}`);
      if (response.data.exists) {
        setErrorMessage("Email already registered.");
        return;
      }
      setGoogleSignup(!googleSignup);

      console.log("isgoogleSignup",!googleSignup)
      // Directly pass the user data to the profile form without calling the API
      navigate("/user-profile-form", {
        state: { userData: { email, name: displayName, googleSignUp: !googleSignup } } // Pass email, name, and isGoogleSignup to profile form
      });
    } catch (error) {
      setErrorMessage("Error during Google sign-in.");
      console.error("Google Sign-In Error:", error.message);
    }
  };

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

          {/* Formik form for user registration */}
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
                  <p className="text-sm text-gray-500 mt-1">
                    Password must be at least 6 characters, contain uppercase and lowercase letters, a number, and a special character.
                  </p>
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
                  className={`w-full bg-purple-${isSubmitting ? "300" : "500"} text-white p-3 rounded-lg hover:bg-purple-${isSubmitting ? "300" : "600"} mb-4`}
                >
                  Register
                </button>
              </Form>
            )}
          </Formik>

          <div className="flex justify-center items-center my-4">
            <span className="text-sm">or sign up with</span>
          </div>

          {/* Google sign-in button */}
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center bg-white py-2 px-6 border border-gray-300 rounded-lg"
          >
            <FcGoogle className="text-xl mr-2" />
            Google
          </button>

          <p className="text-center text-gray-500 font-poppins font-medium text-base leading-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-poppins font-semibold text-blue-500 hover:text-blue-600"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserCreateAccount;
