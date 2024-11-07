import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BodyContent from "./BodyContent";
import { TabProvider } from "./UserHomePageContext/HomePageContext";

const UserMainPage = () => {
  const [userInfo, setUserInfo] = useState(null);

  // Retrieve user info from localStorage on component mount
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo)); // Parse and store in state
    }
  }, []);

  const isApproved = userInfo?.adminApproved;

  return (
    <TabProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          {/* Display content conditionally based on admin approval */}
          {isApproved ? (
            <BodyContent />
          ) : (
            <div className="p-4">
              <h2>User Information</h2>
              {userInfo ? (
                <pre>{JSON.stringify(userInfo, null, 2)}</pre>
              ) : (
                <p>Not approved yet.</p>
              )}
              <div className="mt-4">
                <Skeleton active title={false} paragraph={{ rows: 8 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </TabProvider>
  );
};

export default UserMainPage;
