import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setUser({
        name: userInfo.name || "",
        email: userInfo.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setErrorMessage(null);
    setSuccessMessage("");

    // Check if password is at least 6 characters
    if (user.password.length > 0 && user.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      if (!token) {
        setErrorMessage("No token found. Please log in again.");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post("/api/users/profile", user, config);

      if (data) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ name: data.name, email: data.email, token })
        );

        setSuccessMessage("Profile updated successfully!");
        setUser((prevUser) => ({
          ...prevUser,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      setErrorMessage(
        "Failed to update profile. " + (error.response?.data?.message || "")
      );
    }
  };

  return (
    <div className="min-h-screen mt-12 bg-white-50 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-4xl bg-white p-8 rounded-lg">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => {
              // Discard changes in password and confirm password
              setUser((prevUser) => ({
                ...prevUser,
                password: "",
                confirmPassword: "",
              }));
              setErrorMessage(null);
              setSuccessMessage("");
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={handleUpdateProfile}
          >
            Save
          </button>
        </div>

        <form className="w-full">
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">
            Your profile
          </h2>
          <p className="text-gray-500 mb-6">
            Update your photo and personal details here.
          </p>

          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex flex-col flex-grow">
              <label htmlFor="name" className="text-gray-700 font-medium mb-2">
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                placeholder="Enter your full name"
              />
            </div>

            <div className="flex flex-col flex-grow">
              <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex flex-col flex-grow">
              <label
                htmlFor="password"
                className="text-gray-700 font-medium mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                placeholder="Enter new password"
              />
            </div>

            <div className="flex flex-col flex-grow">
              <label
                htmlFor="confirmPassword"
                className="text-gray-700 font-medium mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm mb-4">{successMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
