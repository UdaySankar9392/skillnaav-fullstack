import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent";
import { TabProvider } from "./UserHomePageContext/HomePageContext";

const AdminMainPage = () => {
  return (
    <TabProvider>
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <BodyContent />
        </div>
      </div>
    </TabProvider>
  );
};

export default AdminMainPage;
