import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
    if (user.password.length < 6) {
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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <div className="mb-4">
        <p className="font-medium">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="font-medium">
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="password" className="block text-gray-700">
            New Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[#7F56D9]"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="block text-gray-700">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[#7F56D9]"
          />
        </div>

        <button
          onClick={handleUpdateProfile}
          className="w-full px-4 py-2 text-white bg-[#7F56D9] rounded-md hover:bg-[#6a47b2] focus:outline-none"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;
