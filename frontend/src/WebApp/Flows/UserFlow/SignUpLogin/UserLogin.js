import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import loginImage from "../../../../assets-webapp/login-image.png";
import axios from "axios";
import Loading from "../../../Warnings/Loading/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Client, Account } from "appwrite";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../../../../api";
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Replace with your Appwrite endpoint
  .setProject("6715ee9b0034e652fb17"); // Replace with your actual project ID

const account = new Account(client);

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      await account.createOAuth2Session("google");
      navigate("/user-main-page"); // Redirect on successful login
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setLoading(true);
    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };
      const { data } = await axios.post("/api/users/login", values, config);
      const token = data.token;
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/user-main-page");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  // Define form fields to use with mapping
  const formFields = [
    {
      name: "email",
      type: "email",
      placeholder: "Enter your email",
    },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Enter your password",
      togglePassword: true,
    },
  ];
  const responseGoogle = async (authResult) => {
    try {
      console.log("Auth Result:", authResult);

      // Ensure authResult contains a code
      if (authResult["code"]) {
        // Pass the code to your backend to exchange it for an access token
        const result = await googleAuth(authResult["code"]);
        console.log("Google Auth Result:", result);

        // Check if the user data is available in the response
        if (result && result.user) {
          const { email, name, image } = result.user; // Access user data directly
          const token = result.token; // Access token as well
          const obj = { email, name, image, token };
          localStorage.setItem("user-info", JSON.stringify(obj));
          console.log("User Info:", { email, name, image });

          // Redirect after successful login
          navigate("/user-main-page");
        } else {
          console.error("User data is not available in the response.");
        }
      }
    } catch (err) {
      console.error("Error while requesting google code:", err);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  // Social login options
  const socialLogins = [
    {
      // onClick: handleGoogleSignIn,
      onClick: googleLogin,
      label: "Sign in with Google",
      icon: <FcGoogle className="h-5 w-5" />,
      bgColor: "bg-red-500",
      hoverColor: "hover:bg-red-600",
    },
    // Add more social login options here if needed
  ];

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
                  {formFields.map((field, index) => (
                    <div className="relative" key={field.name}>
                      <Field
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400"
                      />
                      {field.name === "password" && (
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
                      )}
                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  ))}

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

          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="px-3 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Social Sign-In Buttons */}
          {socialLogins.map((login, index) => (
            <button
              key={index}
              onClick={login.onClick}
              className={`w-full ${login.bgColor} text-white p-3 rounded-lg ${login.hoverColor} mb-4 flex items-center justify-center space-x-2`}
            >
              {login.icon}
              <span>{login.label}</span>
            </button>
          ))}

          <p className="text-center text-gray-500">
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
