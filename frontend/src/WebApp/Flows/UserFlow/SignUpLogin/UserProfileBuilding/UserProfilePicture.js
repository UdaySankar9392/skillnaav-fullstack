import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import uploadButtonIcon from "../../../../../assets-webapp/Upload-button.png"; // Adjust path if needed

const UserProfilePicture = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fieldOfStudy: "",
    profilePicture: null,
    resume: null,
    linkedin: "",
    portfolio: "",
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const navigate = useNavigate();

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
    setResumePreview(file ? file.name : null); // No preview for file, just file name
  };

  const handleDeleteProfilePicture = () => {
    setFormData({ ...formData, profilePicture: null });
    setProfilePreview(null);
  };

  const handleDeleteResume = () => {
    setFormData({ ...formData, resume: null });
    setResumePreview(null);
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // Submit form logic here
      navigate("/user-main-page"); // Navigate after form submission
    }
  };

  const handleSkip = () => {
    navigate("/user-main-page"); // Navigate directly when "Skip" is clicked
  };

  const isFormValid = () => {
    const { fieldOfStudy, profilePicture, resume, linkedin, portfolio } =
      formData;
    return fieldOfStudy && profilePicture && resume && linkedin && portfolio;
  };

  const buttonDisabled = !isFormValid();

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
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
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
        </div>

        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300">
            <h2 className="text-lg font-bold text-gray-700">
              LINKS AND DOCUMENTS
            </h2>
          </div>

          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="profilePicture"
                onChange={handleProfilePictureChange}
                id="profilePictureInput"
                className="hidden"
              />
              {profilePreview ? (
                <div className="relative">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={handleDeleteProfilePicture}
                    className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-red-600 transition duration-200"
                    title="Delete Picture"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="profilePictureInput"
                  className="cursor-pointer block w-full text-center text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                >
                  <img
                    src={uploadButtonIcon}
                    alt="Choose File"
                    className="w-16 h-16 object-cover"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="flex flex-col items-center space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resume or CV
            </label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="resume"
                onChange={handleResumeChange}
                id="resumeInput"
                className="hidden"
              />
              {resumePreview ? (
                <div className="relative">
                  <span className="block w-16 h-16 text-center leading-16">
                    {resumePreview}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteResume}
                    className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="resumeInput"
                  className="cursor-pointer block w-full text-center text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                >
                  <img
                    src={uploadButtonIcon}
                    alt="Choose File"
                    className="w-16 h-16 object-cover"
                  />
                </label>
              )}
            </div>
            <span className="text-xs text-gray-500">PDF (max. 10MB)</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              LinkedIn Profile
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter LinkedIn URL"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Portfolio Website
            </label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter Portfolio URL"
            />
          </div>
        </div>

        {/* <div className="flex justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="py-2 px-4 border border-purple-600 rounded-md shadow-sm text-sm font-medium text-purple-600 hover:bg-purple-100"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={buttonDisabled}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              buttonDisabled
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            Submit
          </button>
        </div> */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="w-1/2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className={`w-1/2 py-2 ml-4 ${
              isFormValid()
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300"
            } text-white rounded-md transition duration-200`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePicture;
