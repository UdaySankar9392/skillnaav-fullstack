import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const UserProfilePicture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fieldOfStudy: location.state?.formData.fieldOfStudy || "", // Field of study from UserProfileForm
    desiredField: "", // New state for desired field
    linkedin: "",
    portfolio: "",
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePicture: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, resume: file });
    setResumePreview(file ? file.name : null);
  };

  const handleSubmit = () => {
    // Combine the formData with location.state.formData
    const completeProfileData = {
      ...location.state.formData,
      ...formData,
    };

    // Log both desired field and field of study along with other data
    console.log("Complete Profile Data:", completeProfileData);
    
    // Here you would handle the data submission to your backend/database
    navigate("/user-main-page");
  };

  const isFormValid = () => {
    const { fieldOfStudy, desiredField, linkedin, portfolio } = formData;
    return fieldOfStudy && desiredField && linkedin && portfolio;
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
              name="desiredField" // Corrected name attribute
              value={formData.desiredField} // Corrected reference to state variable
              onChange={handleChange}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input type="file" onChange={handleProfilePictureChange} className="mt-2" />
              {profilePreview && (
                <div className="mt-4">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
              <input type="file" onChange={handleResumeChange} className="mt-2" />
              {resumePreview && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{resumePreview}</p>
                </div>
              )}
            </div>

            {/* LinkedIn Profile Input */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                LinkedIn Profile
              </label>
              <input
                id="linkedin"
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your LinkedIn profile"
              />
            </div>

            {/* Portfolio Website Input */}
            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                Portfolio Website
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

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isFormValid() ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-300 cursor-not-allowed"
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