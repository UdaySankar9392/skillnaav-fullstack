import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfilePicture = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize formData with profile picture field
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("userProfileData");
    return savedData ? JSON.parse(savedData) : {
      fieldOfStudy: location.state?.formData.fieldOfStudy || "",
      desiredField: "",
      linkedin: "",
      portfolio: "",
      profilePic: null,
    };
  });

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem("userProfileData", JSON.stringify(formData));
  }, [formData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, JPG)");
      return;
    }
    setFormData({ ...formData, profilePic: file });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Combine all form data
    const completeData = {
      ...location.state.formData,
      ...formData,
    };

    // Validate required fields
    const requiredFields = [
      "name", "email", "password", "confirmPassword",
      "universityName", "dob", "educationLevel",
      "fieldOfStudy", "desiredField", "linkedin"
    ];

    if (!requiredFields.every(field => completeData[field])) {
      alert("Please fill all required fields");
      return;
    }

    if (!formData.profilePic) {
      alert("Please upload a profile picture");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append all registration fields
      Object.entries(completeData).forEach(([key, value]) => {
        if (key === "profilePic") return; // Handle file separately
        formDataToSend.append(key, value);
      });

      // Append profile picture with correct field name
      formDataToSend.append("profileImage", formData.profilePic);


      const response = await axios.post("/api/users/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        localStorage.removeItem("userProfileData");
        navigate("/user/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error.response?.data?.error ||
        "Registration failed. Please check your inputs and try again."
      );
    }
  };

  const isFormValid = () => {
    return (
      formData.desiredField &&
      formData.linkedin &&
      formData.profilePic
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300">
            <h2 className="text-lg font-bold text-gray-700">PROFESSIONAL INFORMATION</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Desired field of Internship/Job</label>
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
            <h2 className="text-lg font-bold text-gray-700">UPLOAD PROFILE INFORMATION</h2>
          </div>

          <div className="space-y-4">
            {/* LinkedIn Profile Input */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
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
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">Portfolio Website (Optional)</label>
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

            {/* Profile Image Input */}
            <div>
              <label htmlFor="profilepic" className="block text-sm font-medium text-gray-700">Profile Image</label>
              <input
                id="profilePic"
                type="file"
                name="profilePic"
                onChange={handleFileChange}
                accept="image/*"
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid() ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-300 cursor-not-allowed"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
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
