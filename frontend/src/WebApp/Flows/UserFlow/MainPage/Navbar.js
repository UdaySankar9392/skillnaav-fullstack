import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", image: "" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user info in localStorage (both plain and Google login)
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo")); // Plain login
    const storedGoogleUserInfo = JSON.parse(localStorage.getItem("user-info")); // Google login

    if (storedGoogleUserInfo) {
      setUserInfo({
        name: storedGoogleUserInfo.name,
        email: storedGoogleUserInfo.email,
        image: storedGoogleUserInfo.image, // Google image URL
      });
    } else if (storedUserInfo) {
      setUserInfo({
        name: storedUserInfo.name,
        email: storedUserInfo.email,
        image: "", // No image for plain login
      });
    }
  }, []); // Ensure this only runs on mount

  const handleUserClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear user information from localStorage
    localStorage.removeItem("userInfo");
    localStorage.removeItem("user-info");
    // Redirect to login page
    navigate("/user/login");
  };

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fallback image if the user image is missing
  const fallbackImage = "https://www.example.com/default-avatar.png"; // Your fallback image URL

  return (
    <div className="bg-white font-poppins text-gray-800 p-4 border-b border-gray-300 sticky top-0 z-50 flex justify-between items-center shadow-md">
      {/* Left side (Logo or navigation items can go here) */}
      <div className="text-lg font-semibold">
        {/* Add your logo or navigation links here */}
      </div>

      {/* Right side (User icon with popup) */}
      <div className="relative flex items-center ml-auto space-x-3">
        {/* Display user's name and image in the navbar */}
        {userInfo.name && (
          <span className="text-gray-800 text-sm">{userInfo.name}</span>
        )}

        {/* Display user image or fallback image */}
        <img
          src={userInfo.image || fallbackImage} // Use Google image or fallback image
          alt="User Avatar"
          className="w-10 h-10 rounded-full border-2 border-gray-300"
          onError={(e) => (e.target.src = fallbackImage)} // Fallback if image fails to load
        />

        <button onClick={handleUserClick} className="focus:outline-none">
          <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-gray-800" />
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-36 w-full bg-white shadow-lg rounded-md py-2 border border-gray-300 z-10"
          >
            {userInfo.email && (
              <div className="px-4 py-2 object-contain text-sm text-gray-800 border-b text-center justify-center">
                {userInfo.email}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
