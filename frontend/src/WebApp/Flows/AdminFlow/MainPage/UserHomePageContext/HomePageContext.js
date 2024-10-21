import React, { createContext, useState, useContext } from "react";

const UserHomePageContext = createContext();

export const TabProvider = ({ children }) => {
  const [selectedTab, setSelectedTab] = useState("home");
  const [subTab, setSubTab] = useState(null); // Add subTab state
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const handleSelectTab = (tab) => {
    setSelectedTab(tab);
    setSubTab(null); // Reset subTab when changing main tab
  };

  const handleSelectSubTab = (subTab) => {
    setSubTab(subTab); // Function to set subTab
  };

  const saveJob = (job) => {
    setSavedJobs((prevJobs) => {
      const existingJobIndex = prevJobs.findIndex(
        (savedJob) => savedJob.jobTitle === job.jobTitle
      );
      if (existingJobIndex !== -1) {
        const updatedJobs = [...prevJobs];
        updatedJobs[existingJobIndex] = job;
        return updatedJobs;
      }
      return [...prevJobs, job];
    });
  };

  const removeJob = (job) => {
    setSavedJobs((prevJobs) =>
      prevJobs.filter((j) => j.jobTitle !== job.jobTitle)
    );
  };

  const applyJob = (job) => {
    setApplications((prevJobs) => {
      const existingJobIndex = prevJobs.findIndex(
        (appJob) => appJob.jobTitle === job.jobTitle
      );
      if (existingJobIndex !== -1) {
        return prevJobs;
      }
      return [...prevJobs, job];
    });
  };

  return (
    <UserHomePageContext.Provider
      value={{
        selectedTab,
        subTab,
        handleSelectTab,
        handleSelectSubTab,
        savedJobs,
        saveJob,
        removeJob,
        applications,
        applyJob,
      }}
    >
      {children}
    </UserHomePageContext.Provider>
  );
};

export const useTabContext = () => useContext(UserHomePageContext);
