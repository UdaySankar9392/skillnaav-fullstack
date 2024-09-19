import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBriefcase,
  faPlus,
  faLifeRing,
  faEnvelope,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState("your-job-posts"); // Set default tab to "your-job-posts"
  const { handleSelectTab } = useTabContext();
  const navigate = useNavigate(); // Initialize navigate hook

  const handleTabClick = (tab) => {
    if (tab === "logout") {
      // Clear user information from localStorage
      localStorage.removeItem("userInfo");
      // Redirect to login page
      navigate("/partner/login");
    } else {
      setSelectedTab(tab);
      handleSelectTab(tab);
    }
  };

  // Define menu items
  const menuItems = [
    { id: "your-job-posts", label: "Your Job Posts", icon: faBriefcase },
    { id: "post-a-job", label: "Post A Job", icon: faPlus },
    { id: "messages", label: "Messages", icon: faEnvelope },
    { id: "profile", label: "Profile", icon: faUser },
  ];

  // Define support and logout items
  const actionItems = [
    { id: "support", icon: faLifeRing, label: "Support" },
    {
      id: "logout",
      icon: faSignOutAlt,
      label: "Logout",
      customTextColor: "text-red-600",
      hoverBg: "hover:bg-red-100",
    },
  ];

  // Reusable Sidebar Button Component
  const SidebarButton = ({ item }) => {
    const isSelected = selectedTab === item.id;
    const selectedColor = "bg-[#F0DEFD] text-[#7520A9]";
    const defaultColor =
      item.customTextColor || "text-gray-600 hover:bg-gray-100";

    return (
      <button
        onClick={() => handleTabClick(item.id)}
        className={`flex items-center p-3 rounded-lg w-52 text-left font-semibold ${
          // Changed font-medium to font-semibold
          isSelected ? selectedColor : defaultColor
        }`}
      >
        <FontAwesomeIcon
          icon={item.icon}
          className={`w-5 h-5 mr-3 ${
            isSelected
              ? "text-[#7520A9]"
              : item.customTextColor || "text-gray-600"
          }`}
        />
        <span
          className={`${
            isSelected
              ? "text-[#7520A9]"
              : item.customTextColor || "text-gray-600"
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col justify-between pl-6 pr-6 font-poppins shadow-lg sticky top-0 overflow-y-auto scrollbar-hide">
      {/* Logo Section */}
      <div className="sticky top-0 z-10 bg-white py-4 flex items-center justify-center">
        <img
          src={logo}
          alt="Skillnaav Logo"
          className="h-16 object-contain" // Adjust height and ensure the image maintains aspect ratio
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <SidebarButton item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Support and Logout Section */}
      <div className="mt-6">
        <ul className="space-y-2">
          {actionItems.map((item) => (
            <li key={item.id}>
              <SidebarButton item={item} />
            </li>
          ))}
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
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
