import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth"; // Firebase imports
import { firebaseApp } from "../../../../../config/firebase"; // Import the Firebase app from your Firebase configuration

const UserProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Identify if user is coming from Google signup
  const isGoogleSignup = location.state?.isGoogleSignup || false;

  // Access user data from location state or localStorage
  const userData =
    location.state?.userData || JSON.parse(localStorage.getItem("googleUser"));
  console.log("page 2===", userData.googleSignUp);
  console.log("userData", userData);
  // Initialize form data with user data and additional fields
  const [formData, setFormData] = useState({
    ...userData, // Initialize with existing user data (e.g., name, email, etc.)
    universityName: "",
    dob: null,
    educationLevel: "",
    fieldOfStudy: "",
  });

  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For Google sign-in feedback

  // Effect to load saved data from localStorage if available
  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");
    console.log("saved data from page 2", savedData);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Effect to check form validity (all required fields filled)
  useEffect(() => {
    const { universityName, dob, educationLevel, fieldOfStudy } = formData;
    setIsFormValid(universityName && dob && educationLevel && fieldOfStudy);
  }, [formData]);

  // Handle input changes with debounce for university suggestions
  const debounceTimer = React.useRef(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "universityName") {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const suggestions = universitySuggestions.filter((university) =>
          university.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(suggestions);
      }, 300);
    }
  };

  // Handle date picker change
  const handleDateChange = (date) => {
    if (date) {
      const updatedDate = new Date(date);
      updatedDate.setHours(0, 0, 0, 0);
      setFormData((prevData) => ({
        ...prevData,
        dob: updatedDate,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    try {
      // Create a merged object
      const updatedFormData = {
        ...formData, // Include all existing fields from formData
        ...(userData.googleSignUp ? userData : {}), // Append userData fields only if googleSignUp is true
      };

      console.log("Updated formData", updatedFormData);

      // Update the state with the merged object
      setFormData(updatedFormData);

      // Save the updated formData in localStorage
      localStorage.setItem("userFormData", JSON.stringify(updatedFormData));
     
      navigate("/user-profile-picture", { state: { formData } });
    } catch (error) {
      console.error("Error saving form data:", error.message);
    }
  };

  // Google sign-in logic
  const handleGoogleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the user data from Google sign-in
      const googleUserData = {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      };

      // Set form data with Google user data
      setFormData((prevData) => ({
        ...prevData,
        ...googleUserData,
      }));

      // Save Google user data to localStorage
      localStorage.setItem("googleUser", JSON.stringify(googleUserData));

      // Redirect to profile form
      navigate("/user-profile-form", {
        state: {
          isGoogleSignup: true, // Mark as Google Signup
          userData: googleUserData,
        },
      });
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Example university suggestions
  const universitySuggestions = [
    "Harvard University",
    "Stanford University",
    "University of California",
    "Massachusetts Institute of Technology",
    "Oxford University",
  ];

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setFormData((prevData) => ({
      ...prevData,
      universityName: suggestion,
    }));
    setFilteredSuggestions([]);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <div className="space-y-4">
          <div className="w-full h-12 p-3 bg-[#F9F0FF] border-b border-[#E6C4FB]">
            <h2 className="text-16px font-bold text-gray-700">
              BASIC INFORMATION
            </h2>
          </div>

          {/* Skip Email and Password for Google Sign-in */}
          {!isGoogleSignup && (
            <>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          <div className="relative">
            <label
              htmlFor="universityName"
              className="block text-sm font-medium text-gray-700"
            >
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
              aria-label="University Name"
              autoComplete="off"
            />
            {filteredSuggestions.length > 0 && (
              <ul
                className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto"
                role="listbox"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Select education level */}
          <div>
            <label
              htmlFor="educationLevel"
              className="block text-sm font-medium text-gray-700"
            >
              Education Level
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select your education level</option>
              <option value="highschool">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Field of Study */}
          <div>
            <label
              htmlFor="fieldOfStudy"
              className="block text-sm font-medium text-gray-700"
            >
              Field of Study
            </label>
            <input
              id="fieldOfStudy"
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy || ""}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your field of study"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <DatePicker
              selected={formData.dob}
              onChange={handleDateChange}
              dateFormat="yyyy/MM/dd"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="mt-4">
          {!isGoogleSignup && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              {isLoading ? "Signing in..." : "Sign Up with Google"}
            </button>
          )}
        </div>

        {/* Submit Button */}
        {isFormValid && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-purple-500 text-white py-2 px-4 rounded-md"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileForm;
