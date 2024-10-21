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
import UserApproval from "./UserApproval";
import PartnerApproval from "./PartnerApproval";

const BodyContent = () => {
  const { selectedTab, subTab } = useTabContext(); // Assuming subTab is provided by the context
  console.log("Selected Tab:", selectedTab, "Sub Tab:", subTab);

  // Dummy data for the dashboard; replace with actual data from your state or API
  const dashboardData = {
    partnersCount: 100,
    activeUsersCount: 250,
    internshipsCount: 75,
    totalRevenue: 5000,
  };

  const renderContent = () => {
    const contentMap = {
      home: (
        <div className="bg-white p-8 rounded-lg font-poppins shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Admin Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(dashboardData).map(([key, value]) => (
              <div
                key={key}
                className="bg-blue-100 p-6 rounded-lg shadow-lg flex items-center"
              >
                <div
                  className={`h-8 w-8 mr-4 ${
                    key === "partnersCount"
                      ? "text-blue-600"
                      : key === "activeUsersCount"
                      ? "text-green-600"
                      : key === "internshipsCount"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {key === "partnersCount" ? (
                    <FaUserFriends className="h-8 w-8" />
                  ) : key === "activeUsersCount" ? (
                    <FaUsers className="h-8 w-8" />
                  ) : key === "internshipsCount" ? (
                    <FaBriefcase className="h-8 w-8" />
                  ) : (
                    <FaDollarSign className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {key.replace(/Count/, "").replace(/([A-Z])/g, " $1")}
                  </h3>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      "user-management": <UserManagement />,
      "partner-management": <PartnerManagement />,
      "user-approvals": <UserApproval />, // Render UserApproval when "user-approvals" is selected
      "partner-approvals": <PartnerApproval />, // Render PartnerApproval when "partner-approvals" is selected
      // Add other tabs and their components
    };

    // Check if the selected tab has a corresponding subTab
    if (selectedTab === "user-management" && subTab === "user-approvals") {
      return <UserApproval />;
    }
    if (
      selectedTab === "partner-management" &&
      subTab === "partner-approvals"
    ) {
      return <PartnerApproval />;
    }

    return (
      contentMap[selectedTab] || (
        <p className="text-center text-gray-500">No content available.</p>
      )
    );
  };

  return (
    <div className="flex-1 font-poppins p-6 overflow-auto">
      {renderContent()}
    </div>
  );
};

export default BodyContent;
