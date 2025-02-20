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
      const { data } = await axios.get(`/api/savedJobs/getSavedJobs/${userId}`);
      console.log("✅ Fetched saved jobs:", data);
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching saved jobs:", err);
      setError("Failed to fetch saved jobs. Please try again later.");
    } finally {
      setIsLoadingSavedJobs(false);
    }
  }, [userId]);
   // Only recreate if userId changes

  // Fetch saved jobs when userId changes
  useEffect(() => {
    getSavedJobs();
  }, [getSavedJobs]);

 // In TabProvider.js
 const saveJob = async (job) => {
  try {
    const { data } = await axios.post("/api/savedJobs/save", { userId, jobId: job._id });

    // Ensure jobId exists in response, or manually structure it
    setSavedJobs(prev => [
      ...prev, 
      data?.jobId ? data : { ...data, jobId: job }
    ]);
  } catch (error) {
    console.error("❌ Error saving job:", error.response?.data || error.message);
  }
};

const removeJob = async (jobId) => {
  try {
    await axios.delete(`/api/savedJobs/remove/${userId}/${jobId}`);

    // Update state after successful deletion
    setSavedJobs(prevJobs =>
      prevJobs.filter(job => {
        const jobToCheck = job.savedJob || job;
        return jobToCheck.jobId?._id !== jobId && jobToCheck._id !== jobId;
      })
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
