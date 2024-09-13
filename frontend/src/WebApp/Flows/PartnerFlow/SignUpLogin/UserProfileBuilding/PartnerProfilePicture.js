import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import uploadButtonIcon from "../../../../../assets-webapp/Upload-button.png"; // Adjust path if needed

const PartnerProfilePicture = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fieldOfStudy: "",
    profilePicture: null,
    resume: null,
    linkedin: "",
    portfolio: "",
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
    if (files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleDeleteFile = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreview(null);
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      // onSubmit();
      navigate("/partner-main-page"); // Navigate to the homepage after form submission
    }
  };

  const isFormValid = () => {
    const { fieldOfStudy, profilePicture, resume, linkedin, portfolio } =
      formData;
    return fieldOfStudy && profilePicture && resume && linkedin && portfolio;
  };

  useEffect(() => {
    if (formData.profilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(formData.profilePicture);
    } else {
      setPreview(null);
    }
  }, [formData.profilePicture]);

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
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IT">IT</option>
              <option value="EEE">EEE</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300">
            <h2 className="text-lg font-bold text-gray-700">
              LINKS AND DOCUMENTS
            </h2>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="profilePicture"
                onChange={handleFileChange}
                id="profilePictureInput"
                className="hidden"
              />
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteFile("profilePicture")}
                    className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
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
          <div className="flex flex-col items-center space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resume or CV
            </label>
            <div className="flex flex-col items-center">
              <input
                type="file"
                name="resume"
                onChange={handleFileChange}
                id="resumeInput"
                className="hidden"
              />
              {formData.resume ? (
                <div className="relative">
                  <span className="block w-16 h-16 text-center leading-16">
                    {formData.resume.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile("resume")}
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
        <div>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-full py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${
              buttonDisabled
                ? "bg-[#E9D7FE] text-[#B4A0D1]"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
            disabled={buttonDisabled}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfilePicture;
