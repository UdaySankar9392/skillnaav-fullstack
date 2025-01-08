import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserGoogleProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData || {}; // Access user data passed from Google sign-in

  // Initialize form data, preferring 'name' from Google over 'fullName'
  const [formData, setFormData] = useState({
    fullName: userData?.name || "", // Use 'name' if available, else use an empty string
    email: userData?.email || "",
    googleId: userData?.googleId || "", // Adding UID from Google if available
    token: userData?.token || "", // Getting the token
    dob: null,
    universityName: "",
    educationLevel: "",
    fieldOfStudy: "",
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Update validation for form
  useEffect(() => {
    const { fullName, email, dob, educationLevel, fieldOfStudy } = formData;
    setIsFormValid(fullName && email && dob && educationLevel && fieldOfStudy);
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Filtering university suggestions as user types
    if (name === "universityName") {
      const suggestions = universitySuggestions.filter((university) =>
        university.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(suggestions);
    }
  };

  // Handle date picker change
  const handleDateChange = (date) => {
    const updatedDate = new Date(date);
    updatedDate.setHours(0, 0, 0, 0);
    setFormData((prevData) => ({
      ...prevData,
      dob: updatedDate,
    }));
  };

  const handleSubmit = () => {
    // Create a new object containing only the required fields
    const { fullName, email, googleId, dob, universityName, educationLevel, fieldOfStudy, token } = formData;
    const cleanData = {
      fullName,
      email,
      googleId,
      dob,
      universityName,
      educationLevel,
      fieldOfStudy,
      token, // Ensure token is part of the submitted data
    };

    console.log("Form Data Submitted:", cleanData);

    // Save the clean data to localStorage
    localStorage.setItem("userFormData", JSON.stringify(cleanData));

    // Navigate to user profile picture page with the clean data
    navigate("/google-user-profilepicture", { state: { formData: cleanData } });
  };

  // Example university suggestions (this could come from an API or a more extensive list)
  const universitySuggestions = [
    "Harvard University",
    "Stanford University",
    "University of California",
    "Massachusetts Institute of Technology",
    "Oxford University",
    // Add more universities as needed
  ];

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setFormData((prevData) => ({
      ...prevData,
      universityName: suggestion,
    }));
    setFilteredSuggestions([]); // Clear suggestions after selection
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-[#F9F0FF] border-b border-[#E6C4FB]">
            <h2 className="text-16px font-bold text-gray-700">BASIC INFORMATION</h2>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your Full Name"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your Email"
              disabled
            />
          </div>

          {/* Moved university name input below email */}
          <div>
            <label htmlFor="universityName" className="block text-sm font-medium text-gray-700">University Name</label>
            <input
              id="universityName"
              type="text"
              name="universityName"
              value={formData.universityName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your University Name"
            />
            {filteredSuggestions.length > 0 && (
              <ul className="mt-2 space-y-2 bg-white border rounded-lg shadow-lg absolute z-10 max-w-full">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="cursor-pointer hover:bg-gray-200 p-2"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <DatePicker
              selected={formData.dob}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              placeholderText="DD/MM/YYYY"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-[#F9F0FF] border-b border-[#E6C4FB]">
            <h2 className="text-16px font-bold text-gray-700">EDUCATIONAL INFORMATION</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current level of education</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="highschool"
                  name="educationLevel"
                  value="highschool"
                  checked={formData.educationLevel === "highschool"}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="highschool" className="ml-3 mt-4 block text-sm text-gray-700">Highschool</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="undergraduate"
                  name="educationLevel"
                  value="undergraduate"
                  checked={formData.educationLevel === "undergraduate"}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="undergraduate" className="ml-3 mt-4 block text-sm text-gray-700">Undergraduate</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="graduate"
                  name="educationLevel"
                  value="graduate"
                  checked={formData.educationLevel === "graduate"}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="graduate" className="ml-3 mt-4 block text-sm text-gray-700">Graduate</label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">Desired Field</label>
            <input
              id="fieldOfStudy"
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter Desired Field of Study"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="w-full bg-purple-500 text-white font-semibold py-2 px-4 rounded-md mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default UserGoogleProfileForm;
