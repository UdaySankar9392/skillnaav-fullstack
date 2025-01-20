import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent"; // Main content component
import { TabProvider } from "./UserHomePageContext/HomePageContext";
import axios from "axios"; // Import axios

const UserMainPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [isApproved, setIsApproved] = useState(false); // Track if user is approved
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Track screen size

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userToken"));
        if (token) {
          const response = await axios.get("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserInfo(response.data);
          setIsApproved(response.data.adminApproved);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  return (
    <TabProvider>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} relative`}>
        {/* Sidebar */}
        <Sidebar isMobile={isMobile} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Navbar />

          {loading ? (
            <div className="p-4">
              <Skeleton active />
            </div>
          ) : (
            <div className="relative flex-1">
              <BodyContent />

              {/* Mask features if user is not approved */}
              {!isApproved && (
                <>
                  <div className="absolute inset-0 bg-gray-500 opacity-50 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-white p-4 rounded shadow-md text-center max-w-xs mx-auto">
                      <h2 className="text-lg font-semibold">
                        Account Not Approved
                      </h2>
                      <p className="text-sm">
                        Your account is not approved by an admin yet. Some
                        features may be restricted.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </TabProvider>
  );
};

export default UserMainPage;
