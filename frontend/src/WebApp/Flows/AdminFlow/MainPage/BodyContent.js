import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Correct path
import {
  FaUsers,
  FaUserFriends,
  FaBriefcase,
  FaDollarSign,
} from "react-icons/fa"; // Import icons
import UserManagement from "./UserManagement";
import PartnerManagement from "./PartnerManagement";
const BodyContent = () => {
  const { selectedTab } = useTabContext();
  console.log("Selected Tab:", selectedTab);

  // Dummy data for the dashboard; replace with actual data from your state or API
  const partnersCount = 100; // Replace with actual data
  const activeUsersCount = 250; // Replace with actual data
  const internshipsCount = 75; // Replace with actual data
  const totalRevenue = 5000; // Replace with actual data

  const renderContent = () => {
    switch (selectedTab) {
      case "home":
        return (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Admin Dashboard
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-blue-100 p-6 rounded-lg shadow-lg flex items-center">
                <FaUserFriends className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium">Partners Enrolled</h3>
                  <p className="text-3xl font-bold">{partnersCount}</p>
                </div>
              </div>
              <div className="bg-green-100 p-6 rounded-lg shadow-lg flex items-center">
                <FaUsers className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium">Active Users</h3>
                  <p className="text-3xl font-bold">{activeUsersCount}</p>
                </div>
              </div>
              <div className="bg-yellow-100 p-6 rounded-lg shadow-lg flex items-center">
                <FaBriefcase className="h-8 w-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium">Total Internships</h3>
                  <p className="text-3xl font-bold">{internshipsCount}</p>
                </div>
              </div>
              <div className="bg-red-100 p-6 rounded-lg shadow-lg flex items-center">
                <div className="h-8 w-8 text-red-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium">Total Revenue</h3>
                  <p className="text-3xl font-bold">${totalRevenue}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "user-management":
        return (
          <div className="text-center mt-4">
            <UserManagement />
          </div>
        );

      case "task-management":
        return (
          <div className="text-center mt-4">
            <PartnerManagement />
          </div>
        );

      case "analytics":
        return (
          <div className="text-center mt-4">
            Analytics Content Coming Soon...
          </div>
        );

      case "settings":
        return (
          <div className="text-center mt-4">
            Settings Content Coming Soon...
          </div>
        );

      default:
        return <div className="text-center mt-4">Select a Tab</div>;
    }
  };

  return (
    <div className="flex-1 font-poppins p-6 bg-gray-50">{renderContent()}</div>
  );
};

export default BodyContent;
