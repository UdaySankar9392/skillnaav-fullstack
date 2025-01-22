import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faClipboardList,
  faChartBar,
  faCogs,
  faSignOutAlt,
  faChevronDown,
  faTrash,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../../assets-webapp/Skillnaav-logo.png"; // Replace with your actual logo path
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Adjust path as needed
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState("home");
  const [isPartnerManagementOpen, setPartnerManagementOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // For sidebar toggle (hamburger menu)
  const { handleSelectTab } = useTabContext();
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab === "logout") {
      localStorage.removeItem("userInfo");
      navigate("/admin/login");
    } else {
      setSelectedTab(tab);
      handleSelectTab(tab);
      setIsOpen(false); // Close sidebar on tab click (for mobile)
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle sidebar visibility for mobile/tablets
  };

  return (
    <div>
      {/* Hamburger Icon for Mobile & iPad */}
      <div className="lg:hidden flex justify-between items-center p-4 z-20">
        <FontAwesomeIcon
          icon={faBars}
          className="text-xl text-gray-700 cursor-pointer"
          onClick={toggleMenu}
        />
        <img src={logo} alt="Skillnaav Logo" className="h-12 object-contain" />
      </div>

      {/* Sidebar */}
      <div
        className={`lg:w-64 w-full h-screen bg-white flex flex-col justify-between pl-6 pr-6 font-poppins shadow-lg fixed top-0 left-0 z-10 overflow-y-auto scrollbar-hide transform transition-transform duration-300 ${
          isOpen
            ? "translate-x-0" // Sidebar visible for mobile/tablets
            : "translate-x-[-100%]" // Sidebar hidden for mobile/tablets
        } lg:translate-x-0`} // Always visible on desktop
      >
        {/* Logo Section */}
        <div className="sticky top-0 z-10 bg-white py-4 flex items-center justify-center lg:block">
          <img src={logo} alt="Skillnaav Logo" className="h-16 object-contain" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleTabClick("home")}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === "home"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabClick("user-management")}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === "user-management"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 mr-3" />
                <span>User Management</span>
              </button>
            </li>

            {/* Partner Management with Nested Items */}
            <li>
              <button
                onClick={() => setPartnerManagementOpen(!isPartnerManagementOpen)}
                className="flex items-center justify-between p-3 rounded-lg w-full text-left font-medium text-gray-700 hover:bg-gray-200"
              >
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5 mr-3" />
                  Partner Management
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-4 h-4 transform ${
                    isPartnerManagementOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Nested Partner Management Links */}
              {isPartnerManagementOpen && (
                <ul className="ml-6 mt-2 space-y-2">
                  <li>
                    <button
                      onClick={() => handleTabClick("partner-accounts")}
                      className={`flex items-center p-2 rounded-lg w-full text-left font-medium ${
                        selectedTab === "partner-accounts"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Partner Accounts
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleTabClick("internship-posts")}
                      className={`flex items-center p-2 rounded-lg w-full text-left font-medium ${
                        selectedTab === "internship-posts"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Internship Posts
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button
                onClick={() => handleTabClick("analytics")}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === "analytics"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faChartBar} className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabClick("settings")}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === "settings"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faCogs} className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </button>
            </li>

            {/* Bin Section */}
            <li>
              <button
                onClick={() => handleTabClick("bin")}
                className={`flex items-center p-3 rounded-lg w-full text-left font-medium ${
                  selectedTab === "bin"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faTrash} className="w-5 h-5 mr-3" />
                <span>Bin</span>
              </button>
            </li>
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
                <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main content to adjust when sidebar is open */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        } lg:ml-64`} // Ensure content has a left margin equal to the sidebar width on desktop
      >
        {/* The rest of the content */}
      </div>
    </div>
  );
};

export default Sidebar;
