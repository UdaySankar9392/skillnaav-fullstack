import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import UserManagement from "./UserManagement";
import PartnerManagement from "./InternshipsPosted";
import PartnerAccounts from "./PartnerAccounts";
import Applications from "./Applications"; // New component for Applications
import Bin from "./Bin";
import Dashboard from "./Dashboard"; // Import the Dashboard component

const BodyContent = () => {
  const { selectedTab } = useTabContext();

  const renderContent = () => {
    switch (selectedTab) {
      case "home":
        return <Dashboard />;
      case "user-management":
        return <UserManagement />;
      case "partner-accounts":
        return <PartnerAccounts />;
      case "internship-posts":
        return <PartnerManagement />;
      case "applications":
        return <Applications />;
      case "bin":
        return <Bin />;
      default:
        return <div className="text-center mt-4">Select a Tab</div>;
    }
  };

  return (
    <div className="flex-1 font-poppins p-6 bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default BodyContent;
