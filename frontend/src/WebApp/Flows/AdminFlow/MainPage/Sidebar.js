import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers, // For User Management
  faClipboardList, // For Task Management
  faChartBar, // For Analytics
  faCogs, // For Settings
  faSignOutAlt, // For Logout
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState("home");
  const { handleSelectTab } = useTabContext();
  const navigate = useNavigate(); // Initialize navigate hook

  const handleTabClick = (tab) => {
    if (tab === "logout") {
      // Clear user information from localStorage
      localStorage.removeItem("userInfo");
      // Redirect to login page
      navigate("/admin/login");
    } else {
      setSelectedTab(tab);
      handleSelectTab(tab);
    }
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col justify-between pl-6 pr-6 font-poppins shadow-lg sticky top-0 overflow-y-auto scrollbar-hide">
      {/* Logo Section */}
      <div className="sticky top-0 z-10 bg-white py-4 flex items-center justify-center">
        <img src={logo} alt="Skillnaav Logo" className="h-16 object-contain" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {[
            { id: "home", icon: faHome, label: "Dashboard" },
            { id: "user-management", icon: faUsers, label: "User Management" },
            {
              id: "task-management",
              icon: faClipboardList,
              label: "Partner Management",
            },
            { id: "analytics", icon: faChartBar, label: "Analytics" },
            { id: "settings", icon: faCogs, label: "Settings" },
          ].map(({ id, icon, label }) => (
            <li key={id}>
              <button
                onClick={() => handleTabClick(id)}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === id
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`w-5 h-5 mr-3 ${
                    selectedTab === id ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`${
                    selectedTab === id ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="mt-6">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleTabClick("logout")}
              className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                selectedTab === "logout"
                  ? "bg-red-100 text-red-600"
                  : "text-red-600 hover:bg-red-100"
              }`}
            >
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className={`w-5 h-5 mr-3 ${
                  selectedTab === "logout" ? "text-red-600" : "text-red-500"
                }`}
              />
              <span
                className={`${
                  selectedTab === "logout" ? "text-red-600" : "text-red-700"
                }`}
              >
                Logout
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
