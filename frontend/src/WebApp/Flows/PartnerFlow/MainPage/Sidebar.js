import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faPlane,
  faSearch,
  faEnvelopeOpen,
  faFileAlt,
  faHeart,
  faUser,
  faLifeRing,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed

const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState("home");
  const { handleSelectTab } = useTabContext();
  const navigate = useNavigate(); // Use navigate instead of history

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    handleSelectTab(tab);

    if (tab === "logout") {
      // Remove user information from local storage
      localStorage.removeItem("partnerInfo");

      // Redirect to the login page
      navigate("/partner/login"); // Use navigate instead of history.push
    }
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col justify-between p-6 font-poppins shadow-lg sticky top-0">
      {/* Logo Section */}
      <div className="flex items-center mb-8">
        <img src={logo} alt="Skillnaav Logo" className="w-950 h-96px mr-3" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {[
            { id: "home", icon: faHome, label: "Homepage" },
            {
              id: "aeronautical-jobs",
              icon: faPlane,
              label: "Aeronautical jobs",
            },
            { id: "searchbar", icon: faSearch, label: "Search" },
            { id: "messages", icon: faEnvelopeOpen, label: "Messages" },
            { id: "applications", icon: faFileAlt, label: "Applications" },
            { id: "saved-jobs", icon: faHeart, label: "Saved jobs" },
            { id: "profile", icon: faUser, label: "Profile" },
          ].map(({ id, icon, label }) => (
            <li key={id}>
              <button
                onClick={() => handleTabClick(id)}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === id
                    ? "bg-[#F0DEFD] text-[#7520A9]"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`w-5 h-5 mr-3 ${
                    selectedTab === id ? "text-[#7520A9]" : "text-gray-600"
                  }`}
                />
                <span
                  className={`${
                    selectedTab === id ? "text-[#7520A9]" : "text-gray-600"
                  }`}
                >
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Support and Logout Section */}
      <div>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleTabClick("support")}
              className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                selectedTab === "support"
                  ? "bg-[#F0DEFD] text-[#7520A9]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FontAwesomeIcon
                icon={faLifeRing}
                className={`w-5 h-5 mr-3 ${
                  selectedTab === "support" ? "text-[#7520A9]" : "text-gray-600"
                }`}
              />
              <span
                className={`${
                  selectedTab === "support" ? "text-[#7520A9]" : "text-gray-600"
                }`}
              >
                Support
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => handleTabClick("logout")}
              className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                selectedTab === "logout"
                  ? "bg-[#F0DEFD] text-[#7520A9]"
                  : "text-red-600 hover:bg-red-100"
              }`}
            >
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className={`w-5 h-5 mr-3 ${
                  selectedTab === "logout" ? "text-[#7520A9]" : "text-red-600"
                }`}
              />
              <span
                className={`${
                  selectedTab === "logout" ? "text-[#7520A9]" : "text-red-600"
                }`}
              >
                Logout
              </span>
            </button>
          </li>
        </ul>

        {/* Upgrade Section */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
          <h3 className="text-purple-700 text-sm font-semibold">
            UPGRADE TO PREMIUM
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Your team has used 80% of your available space. Need more?
          </p>
          <button className="mt-4 w-full bg-purple-700 text-white py-2 px-4 rounded-lg">
            Upgrade plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
