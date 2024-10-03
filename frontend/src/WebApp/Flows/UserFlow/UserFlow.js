import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import createAccountImage from "../../../assets-webapp/login-image.png";
import googleIcon from "../../../assets-webapp/Google-icon.png";
import facebookIcon from "../../../assets-webapp/Facebook-icon.png";
import appleIcon from "../../../assets-webapp/Apple-icon.png";
import axios from "axios";
import { Link } from "react-router-dom";

// Validation schema for Formik
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
});

const UserFlow = () => {
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log("Submitting values:", values); // Log the submitted data
      const response = await axios.post("/api/register", values);
      console.log("Response:", response); // Log the response

      // Redirect to /register after successful account creation
      navigate("/register");
    } catch (error) {
      console.error("Error creating account:", error);
    }
    setSubmitting(false); // Ensure the form is not in a submitting state anymore
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-poppins">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <img
          src={createAccountImage}
          alt="Create Account"
          className="w-[830px] h-[900px] object-cover rounded-lg "
        />
      </div>
      <div className="flex flex-col items-center justify-center p-8 w-full lg:w-1/2 bg-white">
        <div className="w-full max-w-md flex flex-col justify-center min-h-screen lg:min-h-full">
          <h1 className="text-3xl font-extrabold mb-4 text-center text-gray-800">
           Dear Student, Welcome!
          </h1>
          <h2 className="text-lg font-medium mb-6 text-center text-gray-600">
            Please sign in to your account
          </h2>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
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

                {/* <div className="mb-4">
                  <Field
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div> */}

                <button
                  type="submit"
                  onClick={() => navigate("/user-create-account")}
                  disabled={isSubmitting}
                  className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-blue-600 mb-4"
                >
                  Get Started
                </button>
              </Form>
            )}
          </Formik>

          <div className="flex items-center my-4">
            <hr className="w-full border-t border-gray-300" />
            <span className="px-3 text-gray-500">OR</span>
            <hr className="w-full border-t border-gray-300" />
          </div>
          {/* <button className="w-full bg-white text-gray-800 p-3 rounded-lg border border-gray-300 hover:bg-gray-100 mb-4 flex items-center justify-center">
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
          </button> */}
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

export default UserFlow;
