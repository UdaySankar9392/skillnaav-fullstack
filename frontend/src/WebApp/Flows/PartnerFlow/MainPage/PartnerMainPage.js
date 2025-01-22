// import React from "react";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
// import BodyContent from "./BodyContent";
// import { TabProvider } from "./UserHomePageContext/HomePageContext";

// const PartnerMainPage = () => {
//   return (
//     <TabProvider>
//       <div className="flex">
//         <Sidebar />
//         <div className="flex-1 flex flex-col">
//           <Navbar />
//           <BodyContent />
//         </div>
//       </div>
//     </TabProvider>
//   );
// };

// export default PartnerMainPage;
import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent"; // Main content component
import { TabProvider } from "./UserHomePageContext/HomePageContext";
import axios from "axios"; // Import axios

const PartnerMainPage = () => {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [adminApproved, setAdminApproved] = useState(false); // Track if partner is approved
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Track screen size

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPartnerInfo = async () => {
      try {
        // Check if the token exists in localStorage
        const token = localStorage.getItem("token");

        // If the token doesn't exist, handle it gracefully (redirect to login, etc.)
        if (!token) {
          console.error("No token found in localStorage.");
          window.location.href = "/login"; // Redirect to login page
          return;
        }

        console.log("Token:", token); // Log the token

        // Use axios to make the API request
        const response = await axios.get("/api/partners/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        });

        // Handle the response data
        setPartnerInfo(response.data);
        setAdminApproved(response.data.adminApproved); // Set approval status based on the response
      } catch (error) {
        console.error("Error fetching partner info:", error);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchPartnerInfo();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  return (
    <TabProvider>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} relative`}>
        {/* Sidebar */}
        <Sidebar isMobile={isMobile} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* Show loading skeleton while fetching data */}
          {loading ? (
            <div className="p-4">
              <Skeleton active />
            </div>
          ) : (
            <div className="relative flex-1">
              {/* Render BodyContent */}
              <BodyContent />

              {/* Mask specific restricted features */}
              {!adminApproved && (
                <div className="absolute inset-0 bg-gray-500 opacity-50 z-10 flex items-center justify-center">
                  <div className="bg-white p-4 rounded shadow-md text-center">
                    <h2 className="text-lg font-semibold">Account Not Approved</h2>
                    <p className="text-sm">
                      Your account is not approved by an admin yet. Certain features are restricted until approval.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TabProvider>
  );
};

export default PartnerMainPage;
