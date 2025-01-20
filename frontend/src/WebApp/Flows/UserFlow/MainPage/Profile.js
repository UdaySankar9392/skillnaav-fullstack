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
    dob: "",
    educationLevel: "",
    fieldOfStudy: "",
    desiredField: "",
    linkedin: "",
    portfolio: "",
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
        dob: userInfo.dob ? new Date(userInfo.dob).toISOString().split("T")[0] : "",
        educationLevel: userInfo.educationLevel || "",
        fieldOfStudy: userInfo.fieldOfStudy || "",
        desiredField: userInfo.desiredField || "",
        linkedin: userInfo.linkedin || "",
        portfolio: userInfo.portfolio || "",
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
        localStorage.setItem("userInfo", JSON.stringify({ ...data, token }));

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

  const fields = [
    { label: "Full name", name: "name", type: "text", placeholder: "Enter your full name" },
    { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email address" },
    { label: "University Name", name: "universityName", type: "text", placeholder: "Enter your university name" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Education Level", name: "educationLevel", type: "text", placeholder: "Enter your education level" },
    { label: "Field of Study", name: "fieldOfStudy", type: "text", placeholder: "Enter your field of study" },
    { label: "Desired Field", name: "desiredField", type: "text", placeholder: "Enter your desired field" },
    { label: "LinkedIn Profile", name: "linkedin", type: "url", placeholder: "Enter your LinkedIn URL" },
    { label: "Portfolio Link", name: "portfolio", type: "url", placeholder: "Enter your portfolio URL" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
  ];

  return (
    <div className="min-h-screen mt-12 bg-white-50 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        {/* Profile Heading */}
        <div className="text-center md:text-left mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Your Profile</h2>
          <p className="text-gray-500 mt-2">
            Update your photo and personal details here.
          </p>
        </div>

        {/* Form Section */}
        <div>
          <form className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {fields.map(({ label, name, type, placeholder }) => (
                <div className="flex flex-col" key={name}>
                  <label htmlFor={name} className="text-gray-700 font-medium mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    id={name}
                    name={name}
                    value={user[name]}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {errorMessage && (
              <p className="text-red-600 mb-4">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-600 mb-4">{successMessage}</p>
            )}
          </form>

          {/* Buttons */}
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
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
