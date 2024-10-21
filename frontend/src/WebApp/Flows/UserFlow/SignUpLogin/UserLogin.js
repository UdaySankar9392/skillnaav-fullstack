import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "../../../../assets-webapp/login-image.png";
import axios from "axios";
import Loading from "../../../Warnings/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { account } from "../../../../appwriteConfig";
import googleIcon from "../../../../assets-webapp/Google-icon.png";
import githubIcon from "../../../../assets-webapp/github-mark-white.svg"; // Make sure to add the GitHub icon

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post("/api/users/login", values, config);
      const token = data.token;
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/user-main-page");
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : "Something went wrong"
      );
      setSubmitting(false);
    }
  };

  // Function to handle Google Sign-In
  const signInWithGoogle = async () => {
    try {
      await account.createOAuth2Session(
        "google",
        "https://www.skillnaav.com/user-main-page", // Success URL
        "https://www.skillnaav.com" // Failure URL
      );
    } catch (err) {
      setError("Google Sign-In failed. Please try again.");
      console.error(err);
      // Redirect to the main site on failure if needed
      window.location.href = "https://www.skillnaav.com";
    }
  };

  // Function to handle GitHub Sign-In
  const signInWithGitHub = async () => {
    try {
      await account.createOAuth2Session(
        "github",
        "https://www.skillnaav.com/user-main-page", // Redirect URL on success
        "https://www.skillnaav.com" // Redirect URL on failure
      );
    } catch (err) {
      setError("GitHub Sign-In failed. Redirecting to home...");
      console.error(err);
      window.location.href = "https://www.skillnaav.com"; // Redirect to main site on failure
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins">
      {/* Left Section (Image) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <img
          src={loginImage}
          alt="login"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Right Section (Form) */}
      <div className="flex flex-col items-center justify-center p-8 w-full lg:w-1/2">
        <div className="w-full max-w-md flex flex-col justify-center min-h-screen lg:min-h-full">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
            Dear Student, Welcome!
          </h1>
          <h2 className="text-lg font-medium mb-6 text-center text-gray-600">
            Please sign in to your account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-200 text-red-600 p-3 mb-4 text-center rounded-lg">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <Loading />
          ) : (
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Email Field */}
                  <div className="relative">
                    <Field
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="w-full p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                    />

                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 mt-3 flex items-center justify-center h-full text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        size="lg"
                      />
                    </button>

                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                      <Field
                        type="checkbox"
                        name="rememberMe"
                        id="rememberMe"
                        className="form-checkbox h-4 w-4 text-purple-500 transition duration-150 ease-in-out"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="block text-sm mt-4 text-gray-700"
                      >
                        Remember me
                      </label>
                    </div>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium mt-4 text-purple-500 hover:text-purple-700 transition duration-150 ease-in-out"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-md"
                  >
                    Sign In
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="px-3 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <img
              src={googleIcon}
              alt="Google Icon"
              className="w-6 h-6 mr-2" // Adjust width and height as needed
            />
            Sign in with Google
          </button>

          {/* GitHub Sign-In Button */}
          <button
            onClick={signInWithGitHub}
            className="flex items-center justify-center w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors duration-200 shadow-md mt-4"
          >
            <img
              src={githubIcon}
              alt="GitHub Icon"
              className="w-6 h-6 mr-2" // Adjust width and height as needed
            />
            Sign in with GitHub
          </button>

          {/* Sign Up */}
          <p className="text-center mt-5 text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/user-create-account"
              className="text-purple-500 hover:underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
