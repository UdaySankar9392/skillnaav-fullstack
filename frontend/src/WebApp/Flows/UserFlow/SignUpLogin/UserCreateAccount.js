import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import { account, googleOAuth } from "../../../../config";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import createAccountImage from "../../../../assets-webapp/login-image.png"; // Adjust the path if needed
import GoogleIcon from "../../../../assets-webapp/Google-icon.png";
import { FcGoogle } from "react-icons/fc";
// Validation schema
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

  const handleSubmit = (values, { setSubmitting }) => {
    try {
      console.log("User Data Submitted:", values);
      navigate("/user-profile-form", { state: { userData: values } });
      localStorage.setItem("userInfo", JSON.stringify(values));
    } catch (error) {
      setErrorMessage("Error registering user. Please try again.");
    }
    setSubmitting(false);
  };

  const handleGoogleSignIn = () => {
    account.createOAuth2Session(
      "google",
      "http://localhost:3000/user-main-page",
      "http://localhost:3000"
    );
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

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 mb-4 flex items-center justify-center space-x-2"
          >
            <FcGoogle className="h-5 w-5" /> {/* Google Icon */}
            <span>Sign up with Google</span>
          </button>
          <p className="text-center text-gray-500 font-poppins font-medium text-base leading-6">
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