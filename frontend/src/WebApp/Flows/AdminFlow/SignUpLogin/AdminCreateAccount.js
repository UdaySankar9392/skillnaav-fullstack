import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
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

const AdminCreateAccount = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post("/api/users/register", values);
      localStorage.setItem("adminInfo", JSON.stringify(response.data));
      navigate("/admin-main-page");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Error registering user. Please try again."
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-teal-700">
          Create an Account
        </h1>
        <p className="text-lg mb-4 text-center text-gray-600">
          Welcome to the Admin Portal. Please create an account to get started.
        </p>

        {errorMessage && (
          <div className="bg-red-100 text-red-800 p-4 mb-4 border border-red-400 rounded-lg text-center">
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
            <Form className="space-y-4">
              {/* Full Name Field */}
              <div className="relative">
                <Field
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                  placeholder="Password"
                  className="w-full p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-5 inset-y-0 right-4 flex items-center"
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <EyeIcon className="h-6 w-6  text-gray-600" />
                  ) : (
                    <EyeSlashIcon className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full p-4 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 mt-5 right-4 flex items-center"
                  aria-label={
                    showConfirmPassword
                      ? "Hide Confirm Password"
                      : "Show Confirm Password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="h-6 w-6 text-gray-600" />
                  ) : (
                    <EyeSlashIcon className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 text-white p-4 rounded-lg hover:bg-teal-700 transition duration-200"
              >
                {isSubmitting ? (
                  <span className="spinner-border animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></span>
                ) : (
                  "Register"
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/admin/login" className="text-teal-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminCreateAccount;
