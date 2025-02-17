import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserHomePageContext = createContext();

export const TabProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("home");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userId = userInfo?._id;

  const getSavedJobs = async () => {
    if (!userId) {
      setIsLoadingSavedJobs(false);
      return;
    }
  
    setIsLoadingSavedJobs(true);
    try {
      const response = await fetch(`http://localhost:5000/api/savedJobs/getSavedJobs/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch saved jobs");
  
      const data = await response.json();
      console.log("✅ Fetched saved jobs:", data); // Debugging log
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching saved jobs:", err);
      setError(err.message);
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };
  

  useEffect(() => {
    getSavedJobs();
  }, [userId]);

// In TabProvider
const saveJob = async (job) => {
  if (!userId) {
    console.error("User not logged in!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/savedJobs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, jobId: job._id }),
    });

    if (!response.ok) throw new Error("Failed to save job");

    const savedJob = await response.json();

    // Update the savedJobs state immediately
    setSavedJobs((prevJobs) => {
      if (!prevJobs.some((j) => j.jobId?._id === job._id)) {
        return [...prevJobs, savedJob];
      }
      return prevJobs;
    });
  } catch (error) {
    console.error("Error saving job:", error);
  }
};
  
  const removeJob = async (jobId) => {
    try {
      setSavedJobs((prevJobs) =>
        prevJobs.filter((job) => job.jobId?._id !== jobId)
      );

      await axios.delete(
        `http://localhost:5000/api/savedJobs/remove/${userId}/${jobId}`
      );
    } catch (error) {
      console.error("❌ Error removing job:", error.response?.data || error.message);
    }
  };

  return (
    <UserHomePageContext.Provider
      value={{
        selectedTab,
        handleSelectTab: setSelectedTab,
        savedJobs,
        getSavedJobs,
        saveJob,
        removeJob,
        applications,
        isLoading,
        error,
        isLoadingSavedJobs,
      }}
    >
      {children}
    </UserHomePageContext.Provider>
  );
};

export const useTabContext = () => useContext(UserHomePageContext);
export { UserHomePageContext };
