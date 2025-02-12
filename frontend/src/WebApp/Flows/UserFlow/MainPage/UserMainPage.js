import React, { useState, useEffect } from "react";
import { Skeleton, Modal, Button } from "antd"; // Import Modal and Button
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent"; 
import { TabProvider } from "./UserHomePageContext/HomePageContext";
import axios from "axios"; 

const UserMainPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false); 

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

  useEffect(() => {
    if (userInfo && !userInfo.isPremium) {
      const interval = setInterval(() => {
        setShowUpgradePopup(true);
        setTimeout(() => setShowUpgradePopup(false), 10000); // Auto-close after 10 sec
      }, 30000); // Show popup every 30 sec

      return () => clearInterval(interval);
    }
  }, [userInfo]);

  return (
    <TabProvider>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} relative`}>
        <Sidebar isMobile={isMobile} />

        <div className="flex-1 flex flex-col">
          <Navbar />

          {loading ? (
            <div className="p-4">
              <Skeleton active />
            </div>
          ) : (
            <div className="relative flex-1">
              <BodyContent />

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

      {/* Premium Upgrade Modal */}
      <Modal
        open={showUpgradePopup}
        onCancel={() => setShowUpgradePopup(false)}
        footer={[
          <Button key="upgrade" type="primary" className="bg-blue-500">
            Upgrade Now
          </Button>,
        ]}
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold">Unlock More Features!</h2>
          <p className="text-gray-600 mt-2">
            Upgrade to <span className="text-blue-500 font-medium">Premium</span> to apply for unlimited jobs, get priority listings, and exclusive opportunities.
          </p>
        </div>
      </Modal>
    </TabProvider>
  );
};

export default UserMainPage;
