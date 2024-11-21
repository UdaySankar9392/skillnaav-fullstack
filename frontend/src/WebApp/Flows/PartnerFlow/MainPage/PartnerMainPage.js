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

const PartnerMainPage = () => {
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [adminApproved, setAdminApproved] = useState(false); // Track if partner is approved

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
  
        const response = await fetch("http://localhost:5000/api/partners/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the header
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch partner info");
        }
  
        const data = await response.json();
        setPartnerInfo(data);
        setAdminApproved(data.adminApproved); // Set approval status based on the response
      } catch (error) {
        console.error("Error fetching partner info:", error);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };
  
    fetchPartnerInfo();
  }, []);
  

  return (
    <TabProvider>
      <div className="flex relative">
        <Sidebar />
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
