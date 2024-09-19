import React, { createContext, useState, useContext } from "react";

const UserHomePageContext = createContext();

export const TabProvider = ({ children }) => {
  // Set 'your-job-posts' as the initial selectedTab to render it by default
  const [selectedTab, setSelectedTab] = useState("your-job-posts");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const handleSelectTab = (tab) => {
    setSelectedTab(tab);
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
        handleSelectTab,
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
