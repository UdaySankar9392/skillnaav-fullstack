import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

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

  const getSavedJobs = useCallback(async () => {
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
      setError("Failed to fetch saved jobs. Please try again later.");
    } finally {
      setIsLoadingSavedJobs(false);
    }
  }, [userId]); // Only recreate if userId changes

  // Fetch saved jobs when userId changes
  useEffect(() => {
    getSavedJobs();
  }, [getSavedJobs]);

 // In TabProvider.js
const saveJob = async (job) => {
  try {
    const response = await fetch("http://localhost:5000/api/savedJobs/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, jobId: job._id }),
    });

    const savedJob = await response.json();
    
    setSavedJobs(prev => [
      ...prev, 
      savedJob?.jobId ? savedJob : { ...savedJob, jobId: job } // Handle population
    ]);
  } catch (error) {
    console.error("Error saving job:", error);
  }
};

  const removeJob = async (jobId) => {
    try {
      setSavedJobs((prevJobs) =>
        prevJobs.filter((job) => {
          const jobToCheck = job.savedJob || job; // Normalize the job object
          return jobToCheck.jobId?._id !== jobId && jobToCheck._id !== jobId;
        })
      );
  
      await axios.delete(`http://localhost:5000/api/savedJobs/remove/${userId}/${jobId}`);
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
