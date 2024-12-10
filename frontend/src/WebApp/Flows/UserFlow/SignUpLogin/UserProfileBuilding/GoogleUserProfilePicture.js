import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfilePicture = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize formData with data passed from UserGoogleProfileForm
  const [formData, setFormData] = useState({
    name: location.state?.formData?.fullName || "",
    email: location.state?.formData?.email || "",
    fieldOfStudy: location.state?.formData?.fieldOfStudy || "",
    desiredField: location.state?.formData?.desiredField || "",
    linkedin: location.state?.formData?.linkedin || "",
    portfolio: location.state?.formData?.portfolio || "",
    universityName: location.state?.formData?.universityName || "",
    dob: location.state?.formData?.dob || "",
    educationLevel: location.state?.formData?.educationLevel || "", // Add educationLevel here
    googleId: location.state?.formData?.googleId || "", // Use googleId instead of uid
    token: location.state?.formData?.token || localStorage.getItem("authToken") || "", // Retrieve token from formData or localStorage
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const completeProfileData = {
      ...formData, // Complete form data including the data passed from Google profile
    };
    console.log("Form Data before submit: ", formData);

    const token = formData.token; // Access token here

    // Validate required fields
    if (
      !completeProfileData.name ||
      !completeProfileData.email ||
      !completeProfileData.universityName ||
      !completeProfileData.dob ||
      !completeProfileData.educationLevel ||
      !completeProfileData.fieldOfStudy ||
      !completeProfileData.desiredField ||
      !completeProfileData.linkedin ||
      !completeProfileData.googleId
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      // Submit data to backend using Axios
      const response = await axios.post(
        "/api/google-users/register",
        completeProfileData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
          },
        }
      );

      if (response.status === 201) {
        navigate("/user-main-page");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const isFormValid = () => {
    return formData.desiredField && formData.linkedin; // Ensure desiredField and linkedin are filled
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300">
            <h2 className="text-lg font-bold text-gray-700">
              PROFESSIONAL INFORMATION
            </h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Desired field of Internship/Job
            </label>
            <select
              name="desiredField"
              value={formData.desiredField}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select Your Field</option>
              <option value="space">Space Internships</option>
              <option value="aero">Aeronautical Internships</option>
              <option value="tech">Tech Internships</option>
              <option value="research">Research Internships</option>
              <option value="education">Education Internships</option>
            </select>
          </div>

          {/* Upload Profile Information Section */}
          <div className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300">
            <h2 className="text-lg font-bold text-gray-700">
              UPLOAD PROFILE INFORMATION
            </h2>
          </div>

          <div className="space-y-4">
            {/* LinkedIn Profile Input */}
            <div>
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700"
              >
                LinkedIn Profile
              </label>
              <input
                id="linkedin"
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                required
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your LinkedIn profile"
              />
            </div>

            {/* Portfolio Website Input (Optional) */}
            <div>
              <label
                htmlFor="portfolio"
                className="block text-sm font-medium text-gray-700"
              >
                Portfolio Website (Optional)
              </label>
              <input
                id="portfolio"
                type="text"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your Portfolio URL"
              />
            </div>
          </div>

          {/* Button Section with Back and Submit Buttons */}
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isFormValid()
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-purple-300 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePicture;
