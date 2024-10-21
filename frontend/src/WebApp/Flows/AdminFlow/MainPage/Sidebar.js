import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faClipboardList,
  faChartBar,
  faSignOutAlt,
  faCheckCircle,
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Sidebar = () => {
  const { handleSelectTab, handleSelectSubTab, selectedTab, subTab } =
    useTabContext(); // Get selectedTab and subTab from context
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab.id === "logout") {
      localStorage.removeItem("userInfo");
      navigate("/admin/login");
    } else {
      handleSelectTab(tab.id);
      handleSelectSubTab(null); // Reset subTab when changing main tab
    }
  };

  const tabs = [
    { id: "home", icon: faHome, label: "Dashboard" },
    {
      id: "user-management",
      icon: faUsers,
      label: "Students",
      subTabs: [
        { id: "user-applications", icon: faClipboard, label: "Applications" },
        { id: "user-approvals", icon: faCheckCircle, label: "Approvals" },
      ],
    },
    {
      id: "partner-management",
      icon: faClipboardList,
      label: "Partners",
      subTabs: [
        {
          id: "partner-applications",
          icon: faClipboard,
          label: "Applications",
        },
        { id: "partner-approvals", icon: faCheckCircle, label: "Approvals" },
      ],
    },
    { id: "analytics", icon: faChartBar, label: "Analytics" },
    { id: "logout", icon: faSignOutAlt, label: "Logout" },
  ];

  const renderNavItem = (tab) => (
    <li key={tab.id}>
      <button
        onClick={() => handleTabClick(tab)}
        className={`flex items-center p-3 rounded-lg w-full text-left font-medium transition-all duration-300 ${
          selectedTab === tab.id
            ? "bg-blue-100 text-blue-600 shadow"
            : "text-gray-600 hover:bg-gray-200 hover:shadow"
        }`}
        aria-label={tab.label}
      >
        <FontAwesomeIcon
          icon={tab.icon}
          className={`w-5 h-5 mr-3 transition-all ${
            selectedTab === tab.id ? "text-blue-600" : "text-gray-500"
          }`}
        />
        <span>{tab.label}</span>
      </button>

      {/* Render sub-tabs if they exist and the parent tab is selected */}
      {tab.subTabs && selectedTab === tab.id && (
        <ul className="pl-6 space-y-2 mt-2">
          {tab.subTabs.map((subTabItem) => (
            <li key={subTabItem.id}>
              <button
                onClick={() => handleSelectSubTab(subTabItem.id)} // Use handleSelectSubTab from context
                className={`flex items-center p-2 rounded-lg w-full text-left text-sm font-medium transition-all duration-300 ${
                  subTab === subTabItem.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FontAwesomeIcon
                  icon={subTabItem.icon}
                  className="w-4 h-4 mr-2"
                />
                <span>{subTabItem.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="w-64 h-screen bg-white flex flex-col justify-between pl-6 pr-6 font-poppins shadow-lg sticky top-0 overflow-y-auto">
      {/* Logo Section */}
      <div className="py-6 flex items-center justify-center border-b border-gray-200 bg-white">
        <img src={logo} alt="Skillnaav Logo" className="h-16 object-contain" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 mt-6">
        <ul className="space-y-2">{tabs.map(renderNavItem)}</ul>
      </nav>

      {/* Footer */}
      <div className="py-4 text-sm text-gray-400 text-center border-t border-gray-200">
        <p>Skillnaav © 2024</p>
      </div>
    </div>
  );
};

export default Sidebar;
