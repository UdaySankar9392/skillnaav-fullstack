import React, { useState, useEffect } from "react";
import Homeimage from "../../../../assets-webapp/Home-Image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faDollarSign, faHeart } from "@fortawesome/free-solid-svg-icons";
import ApplyCards from "./ApplyCards";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Skillnaavlogo from "../../../../assets-webapp/Skillnaavlogo.png";
import PremiumPage from "./PremiumPage";


const MAX_FREE_APPLICATIONS = 5;
const MAX_SAVED_JOBS = 3;

const Home = () => {
  const { savedJobs, saveJob, removeJob } = useTabContext();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobData, setJobData] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [showSavedJobPopup, setShowSavedJobPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  

  const navigate = useNavigate();

  // Fetch job data and user profile only once on mount
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        // Parse userInfo safely
        const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
        const isPremiumUser = userInfo.isPremium ? "true" : "false"; // Ensure correct boolean check

        console.log("Fetching jobs with isPremium:", isPremiumUser); // Debugging log

        const response = await fetch(`/api/interns?isPremium=${isPremiumUser}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch internships: ${errorText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }

        console.log("Received internships:", data.map(i => ({ title: i.jobTitle, type: i.internshipType })));

        setJobData(data);
      } catch (error) {
        console.error("Error fetching job data:", error.message);
      }
    };

    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10)); // Restore scroll position
    }

    const fetchUserProfile = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;
        if (!token) return console.error("No token found in userInfo");

        const { data } = await axios.get("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsPremium(data.isPremium);

        const { data: countData } = await axios.get(`/api/applications/count/${userInfo._id}`);
        setApplicationCount(countData.count);
      } catch (error) {
        console.error("Error fetching user profile or application count:", error);
      }
    };

    fetchJobData();
    fetchUserProfile();
  }, []);

  // Normalize savedJobs array
  useEffect(() => {
    const normalized = savedJobs.map(job => ({
      ...job,
      jobId: job.jobId?.location ? job.jobId : job // Handle population
    }));
    console.log("Normalized jobs:", normalized);
  }, [savedJobs]);

  // Handle View Details (with application limit check)
  const handleViewDetails = async (job) => {
    try {
      sessionStorage.setItem("scrollPosition", window.scrollY); // Store current scroll position
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo) return;

      const { data: countData } = await axios.get(`/api/applications/count/${userInfo._id}`);
      setApplicationCount(countData.count);

      if (!isPremium && countData.count >= MAX_FREE_APPLICATIONS) {
        setShowLimitPopup(true);
      } else {
        setSelectedJob(job);
      }
    } catch (error) {
      console.error("Error fetching updated application count:", error);
    }
  };

  // Restore scroll position after returning to Home
  const handleBack = () => {
    setSelectedJob(null);
    setTimeout(() => {
      const savedPosition = sessionStorage.getItem("scrollPosition");
      if (savedPosition) {
        window.scrollTo(0, parseInt(savedPosition, 10)); // Restore scroll position
      }
    }, 0);
  };


  // Toggle Save Job Logic (check saved job limit)
  const toggleSaveJob = async (job) => {
    try {
      if (!isPremium && savedJobs.length >= MAX_SAVED_JOBS) {
        setShowSavedJobPopup(true); // Show saved job limit popup
        return;
      }

      const jobExists = savedJobs.some((savedJob) => {
        const jobToCheck = savedJob.savedJob || savedJob;
        return jobToCheck.jobId?._id === job._id || jobToCheck._id === job._id;
      });

      if (jobExists) {
        await removeJob(job._id);
      } else {
        await saveJob(job);
      }
    } catch (error) {
      console.error("Error toggling job save:", error);
    }
  };

  // Calculate posted time (to avoid repeated render)
  const calculatePostedTime = (date) => {
    const postedDate = new Date(date);
    const currentDate = new Date();
    const differenceInTime = currentDate - postedDate;
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) return "Today";
    if (differenceInDays === 1) return "Yesterday";
    return `${differenceInDays}d ago`;
  };

  return (
    <div className="font-poppins">
      {selectedJob ? (
        <ApplyCards job={selectedJob} onBack={handleBack} isPremium={isPremium} />
      ) : (
        <>
          {/* Header Section */}
          <div className="relative w-full h-60">
            <img src={Homeimage} alt="Finding Your Dream Job" className="w-full h-full object-cover" />
          </div>


          {/* Jobs Listing */}
          <section className="py-10 px-6">
            <h2 className="text-3xl font-bold mb-2">Find your next role</h2>
            <p className="text-gray-600 mb-6">Recommendations based on your profile</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {jobData.map((job, index) => (
                <div key={index} className="relative border rounded-lg p-6 shadow-sm">

                  {/* Internship Type Badge */}
                  {job.internshipType && (
                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold uppercase rounded-full
                        ${job.internshipType === "FREE" ? "bg-green-100 text-green-700" :
                        job.internshipType === "STIPEND" ? "bg-blue-100 text-blue-700" :
                          job.internshipType === "PAID" ? "bg-red-100 text-red-700" : ""}`}>
                      {job.internshipType}
                    </span>
                  )}

                  {/* Save Button */}
                  <div className="absolute top-10 right-2">
                    <button onClick={() => toggleSaveJob(job)} className="text-gray-500 hover:text-red-500">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`w-6 h-6 ${savedJobs.some(savedJob =>
                          savedJob.jobId?._id === job._id ||
                          savedJob.jobId === job._id
                        ) ? "text-red-500" : "text-gray-500"
                          }`}
                      />
                    </button>
                  </div>

                  {/* Job Details */}
                  <div className="flex items-center mb-4">
                    <img src={job.imgUrl} alt={`${job.companyName} logo`} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
                      <p className="text-gray-600">{job.companyName} • {calculatePostedTime(job.createdAt)}</p>
                    </div>
                  </div>

                  <div className="text-gray-600 mb-4">
                    <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {job.location} • {job.jobType}</p>
                    <p><FontAwesomeIcon icon={faClock} /> {new Date(job.startDate).toLocaleDateString()} - {job.endDateOrDuration}</p>
                    <p>
                      <FontAwesomeIcon icon={faDollarSign} />
                      {job.internshipType === "STIPEND"
                        ? `${job.compensationDetails?.amount} ${job.compensationDetails?.currency} per ${job.compensationDetails?.frequency?.toLowerCase()}`
                        : job.internshipType === "FREE"
                          ? "Unpaid / Free"
                          : job.internshipType === "PAID"
                            ? `Student Pays: ${job.compensationDetails?.amount} ${job.compensationDetails?.currency}`
                            : "N/A"
                      }
                    </p>
                  </div>

                  {/* Qualifications and View Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.qualifications.map((qualification, index) => (
                        <span key={index} className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full">
                          {qualification}
                        </span>
                      ))}
                    </div>
                    <button className="text-purple-600 hover:underline" onClick={() => handleViewDetails(job)}>
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </section>
        </>
      )}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate("/skillnaav-analysis")}
          className=" text-white rounded-full shadow-lg p-4 hover:bg-blue-700 transition duration-300"
        >
          <img src={Skillnaavlogo} alt="Skillnaav Analysis" className="w-12 h-12" />
        </button>
      </div>

       {/* Pricing Modal */}
      {showPricingModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition duration-200"
        onClick={() => setShowPricingModal(false)}
        aria-label="Close modal"
      >
        ✕
      </button>
      <PremiumPage />
    </div>
  </div>
)}

      {/* Application Limit Reached Popup */}
      {showLimitPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800">Application Limit Reached</h2>
            <p className="text-gray-600 mt-2">
              You have reached the maximum of {MAX_FREE_APPLICATIONS} free applications.
            </p>
            <p className="text-gray-600 mt-1">Upgrade your account to apply for more jobs.</p>

            {/* Buttons Container */}
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                onClick={() => setShowLimitPopup(false)}
              >
                Close
              </button>
              <button
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
            onClick={() => {
              setShowLimitPopup(false);
              setShowPricingModal(true);
            }}
          >
            Upgrade Now
          </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Jobs Limit Reached Popup */}
      {showSavedJobPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h2 className="text-xl font-semibold text-gray-800">Saved Jobs Limit Reached</h2>
            <p className="text-gray-600 mt-2">
              You have reached the maximum of {MAX_SAVED_JOBS} saved jobs.
            </p>
            <div className="flex justify-between mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                onClick={() => setShowSavedJobPopup(false)}
              >
                Close
              </button>
              <button
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
            onClick={() => {
              setShowSavedJobPopup(false);
              setShowPricingModal(true);
            }}
          >
            Upgrade Now
          </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;