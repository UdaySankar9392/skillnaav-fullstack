import React, { useState } from "react";
import UnsavedChangesModal from "./ProfileForm";

const ProfileForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    setIsModalOpen(true); // Open the modal when the Save button is clicked
  };

  const handleDiscard = () => {
    setIsModalOpen(false); // Close the modal without saving
  };

  const handleConfirmSave = () => {
    // Your save logic here
    setIsModalOpen(false); // Close the modal after saving
  };

  return (
    <div className="min-h-screen bg-white-50 flex items-center justify-center font-poppins">
      <div className="relative w-full max-w-4xl bg-white p-8 rounded-lg">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={handleSave}
          >
            Save
          </button>
        </div>

        <form className="w-full">
          {/* Form content */}
          <h2 className="text-2xl font-semibold mb-1 text-gray-800">
            Your profile
          </h2>
          <p className="text-gray-500 mb-6">
            Update your photo and personal details here.
          </p>

          {/* Full name */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex flex-col flex-grow">
              <label
                htmlFor="fullName"
                className="text-gray-700 font-medium mb-2"
              >
                Full name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Oliva James"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
            </div>

            <div className="flex flex-col mb-6">
              <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="Oliva@gmail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pl-10"
                />
                <span className="absolute inset-y-0 left-0 flex items-center mt-5 pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016.528 3H3.472a2 2 0 00-1.469 2.884zM18 8.118l-8 4-8-4V13a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          {/* Photo upload */}
          <div className="mb-6 flex flex-col sm:flex-row items-center">
            <label
              htmlFor="photo"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              Your photo
            </label>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4">
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center cursor-pointer text-purple-600 hover:text-purple-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16.928V13a4 4 0 014-4h8a4 4 0 014 4v3.928a2 2 0 01-1.052 1.754l-6.633 3.317a4 4 0 01-3.63 0l-6.633-3.317A2 2 0 014 16.928z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12v.01M12 6v6M12 18h0"
                    />
                  </svg>
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-sm text-gray-500">
                    or drag and drop
                  </span>
                  <span className="text-sm text-gray-400 mt-1">
                    PNG, JPG (max. 800x400px)
                  </span>
                  <input type="file" id="photo" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Date of birth */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label
              htmlFor="dob"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              Date of birth
            </label>
            <input
              type="date"
              id="dob"
              placeholder="03/05/1998"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-3/4"
            />
          </div>

          {/* Field of Study */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label
              htmlFor="fieldOfStudy"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              Field of Study
            </label>
            <select
              id="fieldOfStudy"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-3/4"
            >
              <option>Mechanical Engineering</option>
              <option>Computer Science</option>
              <option>Business Administration</option>
            </select>
          </div>

          {/* Current level of education */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label className="text-gray-700 font-medium mt-5 mr-4 sm:w-1/4">
              Current level of education
            </label>
            <div className="flex items-center w-full sm:w-3/4">
              <div className="flex items-center mr-6">
                <input
                  type="radio"
                  id="highschool"
                  name="educationLevel"
                  className="form-radio text-purple-500"
                />
                <label htmlFor="highschool" className="ml-2 mt-5 text-gray-700">
                  Highschool
                </label>
              </div>
              <div className="flex items-center mr-6">
                <input
                  type="radio"
                  id="undergraduate"
                  name="educationLevel"
                  className="form-radio text-purple-500"
                />
                <label htmlFor="undergraduate" className="ml-2 mt-5 text-gray-700">
                  Undergraduate
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="graduate"
                  name="educationLevel"
                  className="form-radio text-purple-500"
                />
                <label htmlFor="graduate" className="ml-2 mt-5 text-gray-700">
                  Graduate
                </label>
              </div>
            </div>
          </div>

          {/* Desired field of internship/job */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label
              htmlFor="desiredField"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              Desired field of internship/job
            </label>
            <select
              id="desiredField"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-3/4"
            >
              <option>Mechanical Engineering</option>
              <option>Software Development</option>
              <option>Marketing</option>
            </select>
          </div>

          {/* LinkedIn profile */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label
              htmlFor="linkedin"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              LinkedIn profile
            </label>
            <input
              type="url"
              id="linkedin"
              placeholder="www.linkedin.com/in/yourprofile"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-3/4"
            />
          </div>

          {/* Portfolio link */}
          <div className="mb-6 flex flex-col sm:flex-row">
            <label
              htmlFor="portfolio"
              className="text-gray-700 font-medium mb-2 sm:w-1/4"
            >
              Portfolio link
            </label>
            <input
              type="url"
              id="portfolio"
              placeholder="www.behance.net/yourportfolio"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-3/4"
            />
          </div>
        </form>
      </div>

      {/* Render the UnsavedChangesModal if isModalOpen is true */}
      {isModalOpen && (
        <UnsavedChangesModal
          onSave={handleConfirmSave}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  );
};

export default ProfileForm;
