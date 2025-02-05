import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LevelThree from './LevelThree'; // Import the LevelThree component

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
    financialStatus: "",
    state: "",
    country: "",
    city: "",
    postalCode: "",
    currentGrade: "",
    gradePercentage: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLevel1Open, setIsLevel1Open] = useState(true);
  const [isLevel2Open, setIsLevel2Open] = useState(false);
  const [isLevel3Open, setIsLevel3Open] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        if (token) {
          const config = {
            headers: { Authorization: `Bearer ${token}` },
          };

          const { data } = await axios.get("/api/users/profile", config);
          setUser((prevUser) => ({
            ...prevUser,
            ...data,
            password: "",
            confirmPassword: "",
            dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setErrorMessage("Failed to load profile data.");
      }
    };

    fetchUserProfile();
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

    if (user.password && user.password.length < 6) {
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
      console.error("Update error:", error);
      setErrorMessage("Failed to update profile. " + (error.response?.data?.message || "Unknown error"));
    }
  };

  const level1Fields = [
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

  const level2Fields = [
    { label: "Financial Status", name: "financialStatus", type: "text", placeholder: "Enter your financial status" },
    { label: "Country", name: "country", type: "text", placeholder: "Enter your country" },
    { label: "State", name: "state", type: "text", placeholder: "Enter your state" },
    { label: "City", name: "city", type: "text", placeholder: "Enter your city" },
    { label: "Postal Code", name: "postalCode", type: "text", placeholder: "Enter your postal code" },
    { label: "Current Grade", name: "currentGrade", type: "text", placeholder: "Enter your current grade" },
    { label: "Grade Percentage", name: "gradePercentage", type: "text", placeholder: "Enter your grade percentage" },
  ];

  return (
    <div className="min-h-screen mt-12 bg-white-50 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center md:text-left mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Your Profile</h2>
          <p className="text-gray-500 mt-2">Update your photo and personal details here.</p>
        </div>

        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

        <form>
          {[{ level: 1, isOpen: isLevel1Open, toggle: setIsLevel1Open, fields: level1Fields }, { level: 2, isOpen: isLevel2Open, toggle: setIsLevel2Open, fields: level2Fields }].map(({ level, isOpen, toggle, fields }) => (
            <div key={level}>
              <div className="flex items-center justify-between mt-6">
                <h3 className="text-2xl font-semibold text-gray-800">Profile Level {level}</h3>
                <button
                  type="button"
                  onClick={() => toggle(!isOpen)}
                  className="text-gray-500 focus:outline-none"
                >
                  {isOpen ? '▲' : '▼'}
                </button>
              </div>
              {isOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  {fields.map(({ label, name, type, placeholder }) => (
                    <div className="flex flex-col" key={name}>
                      <label htmlFor={name} className="text-sm font-medium text-gray-600 mb-2">{label}</label>
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={user[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="px-4 py-2 border rounded-md"
                      />
                    </div>
                  ))}
                  {level === 2 && (
                    <button
                      type="button"
                      onClick={handleUpdateProfile}
                      className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-md"
                    >
                      Save/Update Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-2xl font-semibold text-gray-800">Profile Level 3 (Personality Questions)</h3>
              <button
                type="button"
                onClick={() => setIsLevel3Open(!isLevel3Open)}
                className="text-gray-500 focus:outline-none"
              >
                {isLevel3Open ? '▲' : '▼'}
              </button>
            </div>
            {isLevel3Open && (
              <LevelThree
                profileData={user}
                createLevelThree={isLevel3Open}
                setCreateLevelThree={setIsLevel3Open}
                handleProfileData={handleUpdateProfile}
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
