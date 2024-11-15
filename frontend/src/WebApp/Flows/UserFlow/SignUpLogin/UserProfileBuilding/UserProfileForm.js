import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData || {}; // Access user data


  // Initialize form data with empty values (to ensure empty fields on initial load)
  const [formData, setFormData] = useState({
    universityName: "",
    dob: null,
    educationLevel: "",
    fieldOfStudy: "",
    ...userData, // Initialize formData with userData if available
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);

  // Effect to handle loading form data from location state or localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");

    if (savedData) {
      // Load saved data from localStorage
      setFormData(JSON.parse(savedData));
    }
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Update validation for form
  useEffect(() => {
    const { universityName, dob, educationLevel, fieldOfStudy } = formData;
    setIsFormValid(universityName && dob && educationLevel && fieldOfStudy);
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
    // Log formData to console
    console.log("Form Data Submitted:", formData);
  
    // Save data to localStorage
    localStorage.setItem("userFormData", JSON.stringify(formData));
  
    // Navigate to user profile picture page
    navigate("/user-profile-picture", { state: { formData } });
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
          <div className="relative">
            <label htmlFor="universityName" className="block text-sm font-medium text-gray-700">
              University Name
            </label>
            <input
              id="universityName"
              type="text"
              name="universityName"
              value={formData.universityName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your University Name"
              autoComplete="off"
            />
            {filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(suggestion)} className="cursor-pointer px-4 py-2 hover:bg-purple-100">
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
            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">Field of Study</label>
            <select
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select your field of study</option>
              <option value="eng">Engineering Internships</option>
              <option value="med">Medical Internships</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            disabled={!isFormValid}
            onClick={handleSubmit}
            className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 disabled:bg-gray-400"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
