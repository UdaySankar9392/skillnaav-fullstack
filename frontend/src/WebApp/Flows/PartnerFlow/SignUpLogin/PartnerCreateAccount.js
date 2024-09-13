import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import createAccountImage from "../../../../assets-webapp/login-image.png"; // Update the path as needed
import googleIcon from "../../../../assets-webapp/Google-icon.png";
import facebookIcon from "../../../../assets-webapp/Facebook-icon.png";
import appleIcon from "../../../../assets-webapp/Apple-icon.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"; // Ensure these are the correct imports
import { Link } from "react-router-dom";

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

const PartnerCreateAccount = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post("/api2/api/users/register", values);
      navigate("/partner-main-page");
      localStorage.setItem("partnerInfo", JSON.stringify(response.data));
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Error registering user. Please try again.");
      }
    }
    setSubmitting(false);
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

                {/* <div className="mb-4 relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 mt-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 mt-2 text-gray-500" />
                    )}
                  </button>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div> */}
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
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 mb-4"
                >
                  <a href="/partner-profile-form">Register</a>
                </button>
              </Form>
            )}
          </Formik>

          <div className="flex items-center my-4">
            <hr className="w-full border-t border-gray-300" />
            <span className="px-3 text-gray-500">OR</span>
            <hr className="w-full border-t border-gray-300" />
          </div>

          <button className="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 mb-4 flex items-center justify-center">
            <span className="mr-2">
              <img src={googleIcon} alt="Google" className="h-5 w-5" />
            </span>
            <span className="font-poppins font-semibold text-base leading-6">
              Sign Up with Google
            </span>
          </button>
          <button className="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 mb-4 flex items-center justify-center">
            <span className="mr-2">
              <img src={facebookIcon} alt="Facebook" className="h-5 w-5" />
            </span>
            <span className="font-poppins font-semibold text-base leading-6">
              Sign Up with Facebook
            </span>
          </button>
          <button className="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 mb-4 flex items-center justify-center">
            <span className="mr-2">
              <img src={appleIcon} alt="Apple" className="h-5 w-5" />
            </span>
            <span className="font-poppins font-semibold text-base leading-6">
              Sign Up with Apple
            </span>
          </button>

          <p className="text-center text-gray-500 font-poppins font-medium text-base leading-6">
            Already have an account?{" "}
            <Link to="/partner/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerCreateAccount;
