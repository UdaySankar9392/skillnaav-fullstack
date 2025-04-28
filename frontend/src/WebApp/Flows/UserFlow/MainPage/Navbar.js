import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faBell } from "@fortawesome/free-solid-svg-icons"; // Import the FontAwesome bell icon
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { fine } = useTabContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", profileImage: "" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { selectedTab, handleSelectTab } = useTabContext();

  useEffect(() => {
    // Retrieve userInfo from localStorage and set it to state
    const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo); // Update the user info state
    }
  }, []);

  const handleUserClick = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility when profile image is clicked
  };

  const handleLogout = () => {
    // Clear user information from localStorage
    localStorage.removeItem("userInfo");
    // Redirect to user login page
    navigate("/user/login");
  };

  // Handle clicks outside of the dropdown
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

  return (
    <div className="bg-white font-poppins text-gray-800 p-4 border-b border-gray-300 sticky top-0 z-50 flex justify-between items-center">
      {/* Left side: Skillnaav logo */}
      <div className="flex items-center lg:hidden md:hidden">
        <img
          src={logo}
          alt="Skillnaav Logo"
          className="h-10 object-contain"
        />
      </div>

      <div className="relative ml-auto flex items-center space-x-4">
        {/* Notification bell icon - now moved left of profile */}
        <div className="relative cursor-pointer">
          <FontAwesomeIcon
            icon={faBell}
            className="w-5 h-5 text-gray-700"
            onClick={() => handleSelectTab("notifications")}
          />
          <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {/* Notification count here if needed */}
          </span>
        </div>

        {/* Display profile image or fallback icon */}
        {userInfo.profileImage ? (
          <img
            src={userInfo.profileImage}
            alt="User Profile"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            onClick={handleUserClick}
          />
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            className="w-8 h-8 text-gray-800 cursor-pointer"
            onClick={handleUserClick}
          />
        )}

        {/* Display user's name */}
        {userInfo.name && (
          <span className="text-gray-800 text-sm">{userInfo.name}</span>
        )}

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-12 w-48 bg-white shadow-lg rounded-md py-2 border border-gray-300"
          >
            {userInfo.email && (
              <div className="px-4 py-2 text-sm text-gray-800">
                {userInfo.email}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100"
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
