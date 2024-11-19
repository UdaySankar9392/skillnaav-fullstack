// import React, { useState, useEffect } from "react";
// import { Skeleton } from "antd";
// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
// import BodyContent from "./BodyContent";
// import { TabProvider } from "./UserHomePageContext/HomePageContext";

// const UserMainPage = () => {
//   const [userInfo, setUserInfo] = useState(null);
//   const [loading, setLoading] = useState(true); // Loading state
//   const [isApproved, setIsApproved] = useState(false); // Track if user is approved

//   useEffect(() => {
//     const fetchUserInfo = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/api/users/users", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch user info");
//         }

//         const data = await response.json();
//         setUserInfo(data);
//         setIsApproved(data.adminApproved); // Set approval status based on the response
//       } catch (error) {
//         console.error("Failed to fetch user info:", error);
//       } finally {
//         setLoading(false); // Stop loading once the data is fetched
//       }
//     };

//     fetchUserInfo();
//   }, []);

//   return (
//     <TabProvider>
//       <div className="flex relative">
//         <Sidebar />
//         <div className="flex-1 flex flex-col">
//           <Navbar />

//           {/* Show loading skeleton while fetching data */}
//           {loading ? (
//             <div className="p-4">
//               <Skeleton active />
//             </div>
//           ) : (
//             <>
//               {/* Render BodyContent only if user is approved */}
//               {isApproved ? (
//                 <BodyContent />
//               ) : (
//                 <div className="p-4">
//                   <h2>User Information</h2>
//                   <p>User account is not approved by admin yet.</p>
//                 </div>
//               )}

//               {/* Mask content if user is not approved */}
//               {!isApproved && userInfo && (
//                 <div className="absolute inset-0 bg-gray-500 opacity-50 z-10" />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </TabProvider>
//   );
// };

// export default UserMainPage;









import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent";
import { TabProvider } from "./UserHomePageContext/HomePageContext";

const UserMainPage = () => {
  return (
    <TabProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <BodyContent />
        </div>
      </div>
    </TabProvider>
  );
};

export default UserMainPage;



