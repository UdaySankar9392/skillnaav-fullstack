import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import partner2Image from "../../../../assets-webapp/partner2_img.jpg";

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

const PartnerCreateAccount = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log("User Data Submitted:", values); // Log user data to console

      // Simulate successful registration (you'll replace this with your actual API call)
      // Here is where you would normally call your API, e.g.:
      // const response = await axios.post("your-api-url/register", values);

      // Store the form data in localStorage
      localStorage.setItem("userInfo", JSON.stringify(values));

      // Navigate to the profile picture page
      navigate("/partner-profile-picture", { state: { userData: values } });
    } catch (error) {
      setErrorMessage("Error registering user. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins">
      <div className="hidden md:flex md:w-full lg:w-1/2 items-center justify-center">
        <img
          src={partner2Image}
          alt="Create Account"
          className="w-full h-full object-contain max-w-[830px] max-h-[900px] p-6 ml-6 shadow-lg"
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
                  className="w-full bg-teal-500 text-white p-4 rounded-lg hover:bg-teal-600 transition-colors duration-300 shadow-md"
                >
                  Register
                </button>
              </Form>
            )}
          </Formik>

          <div className="flex items-center my-4">
            <hr className="w-full border-t border-gray-300" />
            <span className="px-3 text-gray-500">OR</span>
            <hr className="w-full border-t border-gray-300" />
          </div>

          <p className="text-center text-gray-500 font-poppins font-medium text-base leading-6">
            Already have an account?{" "}
            <Link
              to="/partner/login"
              className="text-teal-500 hover:underline font-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerCreateAccount;
