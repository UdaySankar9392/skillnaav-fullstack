import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityName: "",
    institutionId: "",
    adminApproved: false,
    active: false,
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
        universityName: userInfo.universityName || "",
        institutionId: userInfo.institutionId || "",
        adminApproved: userInfo.adminApproved || false,
        active: userInfo.active || false,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: type === "checkbox" ? checked : value,
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

      const { data } = await axios.post("/api/partners/profile", user, config);

      if (data) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...user, token }) // Save additional fields here
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

  const inputFields = [
    { label: "Full name", name: "name", type: "text", placeholder: "Enter your full name" },
    { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email address" },
    { label: "University Name", name: "universityName", type: "text", placeholder: "Enter your university name" },
    { label: "Institution ID", name: "institutionId", type: "text", placeholder: "Enter your institution ID" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter new password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm new password" },
  ];

  return (
    <div className="min-h-screen mt-12 bg-white-50 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-4xl bg-white p-6 sm:p-8 rounded-lg shadow-lg">
        {/* Action buttons */}
        <div className="flex space-x-4 mt-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => {
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
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={handleUpdateProfile}
            >
              Save
            </button>
          </div>

        <form className="w-full">
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">Your profile</h2>
          <p className="text-gray-500 mb-6">Update your photo and personal details here.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {inputFields.map((field, index) => (
              <div key={index} className="flex flex-col">
                <label htmlFor={field.name} className="text-gray-700 font-medium mb-2">{field.label}</label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={user[field.name]}
                  onChange={handleChange}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
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
