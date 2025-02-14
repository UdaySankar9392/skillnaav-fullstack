import React, { useState, useEffect } from "react";
import Homeimage from "../../../../assets-webapp/Home-Image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import ApplyCards from "./ApplyCards";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import axios from "axios";

const MAX_FREE_APPLICATIONS = 5;

const Home = () => {
  const { savedJobs, saveJob, removeJob } = useTabContext();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const response = await fetch("/api/interns/");
        const data = await response.json();
        const approvedJobs = data.filter((job) => job.adminApproved);
        setJobData(approvedJobs);
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;
        console.log("Fetched user info:", userInfo);

        if (!token) {
          console.error("No token found in userInfo");
          return;
        }

        // Fetch user profile data
        const { data } = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("User profile response:", data); // Debugging
        setIsPremium(data.isPremium);

        // Fetch application count
        const studentId = userInfo._id;
        const { data: countData } = await axios.get(`/api/applications/count/${studentId}`);
        console.log("Application count response:", countData); // Debugging
        setApplicationCount(countData.count);
      } catch (error) {
        console.error("Error fetching user profile or application count:", error);
      }
    };

    fetchJobData();
    fetchUserProfile();
  }, []);

  const calculatePostedTime = (date) => {
    const postedDate = new Date(date);
    const currentDate = new Date();

    const differenceInTime = currentDate - postedDate; // Difference in milliseconds
    const differenceInHours = Math.floor(differenceInTime / (1000 * 60 * 60)); // Convert to hours
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days

    if (differenceInDays === 0) {
      return differenceInHours === 0
        ? "Just now"
        : differenceInHours === 1
        ? "1 hour ago"
        : `${differenceInHours} hours ago`;
    } else if (differenceInDays === 1) {
      return "Yesterday";
    } else {
      return `${differenceInDays}d ago`;
    }
  };

  const handleViewDetails = async (job) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;
  
      const studentId = userInfo._id;
      const { data: countData } = await axios.get(`/api/applications/count/${studentId}`);
      
      setApplicationCount(countData.count); // Update state with latest count
      console.log("Updated application count:", countData.count);
  
      if (!isPremium && countData.count >= MAX_FREE_APPLICATIONS) {
        setShowLimitPopup(true);
      } else {
        setSelectedJob(job);
      }
    } catch (error) {
      console.error("Error fetching updated application count:", error);
    }
  };
  
  const handleBack = () => {
    setSelectedJob(null);
  };

  const toggleSaveJob = (job) => {
    if (savedJobs.some((savedJob) => savedJob.jobTitle === job.jobTitle)) {
      removeJob(job);
    } else {
      saveJob({ ...job, isApplied: false });
    }
  };

  return (
    <div className="font-poppins">
      {selectedJob ? (
        <ApplyCards job={selectedJob} onBack={handleBack} isPremium={isPremium} />
      ) : (
        <>
          {/* Header Section */}
          <div className="relative w-1132px h-250px">
            <img
              src={Homeimage}
              alt="Finding Your Dream Job"
              className="w-full h-full object-cover"
            />
          </div>

          <section className="py-10 px-6">
            <h2 className="text-3xl font-bold mb-2">Find your next role</h2>
            <p className="text-gray-600 mb-6">
              Recommendations based on your profile
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {jobData.map((job, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg p-6 shadow-sm"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`w-6 h-6 ${
                          savedJobs.some(
                            (savedJob) => savedJob.jobTitle === job.jobTitle
                          )
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center mb-4">
                    <img
                      src={job.imgUrl}
                      alt={`${job.companyName} logo`}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                      <p className="text-gray-600">
                        {job.companyName} • {calculatePostedTime(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-600 mb-4">
                    <p>
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location} •{" "}
                      {job.jobType}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faClock} />{" "}
                      {new Date(job.startDate).toLocaleDateString()} -{" "}
                      {job.endDateOrDuration}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faDollarSign} />{" "}
                      {job.salaryDetails}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.qualifications.map((qualification, index) => (
                        <span
                          key={index}
                          className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full"
                        >
                          {qualification}
                        </span>
                      ))}
                    </div>
                    <button
                      className="text-purple-600 hover:underline"
                      onClick={() => handleViewDetails(job)}
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Limit Reached Popup */}
      {showLimitPopup && (
        console.log("Rendering limit popup"), // Debugging
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800">Application Limit Reached</h2>
            <p className="text-gray-600 mt-2">You have reached the maximum of {MAX_FREE_APPLICATIONS} free applications.</p>
            <p className="text-gray-600 mt-1">Upgrade your account to apply for more jobs.</p>
            <button
              className="bg-purple-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-purple-600"
              onClick={() => setShowLimitPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;