import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaShareAlt, FaMapMarkerAlt, FaBriefcase, FaDollarSign } from "react-icons/fa";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import SkillAnalysis from "./SkillnaavAnalysis"; // Import the SkillAnalysis component

const MAX_FREE_APPLICATIONS = 5;

const ApplyCards = ({ job, onBack }) => {
  const { savedJobs, saveJob, removeJob } = useTabContext();
  const [isApplied, setIsApplied] = useState(false);
  const [resume, setResume] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [showSkillAnalysis, setShowSkillAnalysis] = useState(false); // State to control the SkillAnalysis popup
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicationData = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const studentId = userInfo?._id;
      if (!studentId) return;

      try {
        const { data: userData } = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        setIsPremium(userData.isPremium);

        const { data: appliedData } = await axios.get(`/api/applications/check-applied/${studentId}/${job._id}`);
        setIsApplied(appliedData.isApplied);

        const { data: countData } = await axios.get(`/api/applications/count/${studentId}`);
        console.log("Fetched application count:", countData.count);
        setApplicationCount(countData.count);
      } catch (error) {
        console.error("Error fetching application data:", error);
      }
    };

    fetchApplicationData();
  }, [job._id]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, DOC, and DOCX files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB.");
        return;
      }
      setResume(file);
    }
  };

  const handleApply = async () => {
    if (isApplied) return;

    if (!resume) {
      setShowResumePopup(true);
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const studentId = userInfo ? userInfo._id : null;
    if (!studentId) return;

    try {
      const { data: countData } = await axios.get(`/api/applications/count/${studentId}`);
      if (!isPremium && countData.count >= MAX_FREE_APPLICATIONS) {
        setShowLimitPopup(true);
        return;
      }
    } catch (error) {
      console.error("Error fetching application count before applying:", error);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("studentId", studentId);
      formData.append("internshipId", job._id);
      formData.append("resume", resume);

      const apiResponse = await axios.post("/api/applications/apply", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (apiResponse.status === 201) {
        setIsApplied(true);

        const { data: updatedCount } = await axios.get(`/api/applications/count/${studentId}`);
        setApplicationCount(updatedCount.count);
        console.log("Updated application count:", updatedCount.count);
      }
    } catch (error) {
      console.error("Error applying for the job:", error);

      if (error.response && error.response.status === 403) {
        setShowLimitPopup(true);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSaveJob = () => {
    if (savedJobs.some((savedJob) => savedJob.jobTitle === job.jobTitle)) {
      removeJob(job);
    } else {
      saveJob(job);
    }
  };

  const handleSkillAnalysis = () => {
    // Ensure job details are available before opening SkillAnalysis
    if (!job || !job.jobDescription || !job.qualifications) {
      alert("Job details are incomplete. Cannot perform skill analysis.");
      return;
    }
    setShowSkillAnalysis(true); // Open the SkillAnalysis popup
  };

  const closeSkillAnalysis = () => {
    setShowSkillAnalysis(false); // Close the SkillAnalysis popup
  };

  return (
    <div className="relative bg-white rounded-lg shadow-lg max-w-full mx-auto p-4 sm:p-6 lg:p-8 xl:p-12 overflow-auto">
      <button className="text-gray-500 w-12 h-12 text-sm mb-4" onClick={onBack}>
        &lt; back
      </button>

      <div className="flex flex-col md:flex-row items-start justify-between mb-4">
        <div className="flex items-start mb-4 md:mb-0">
          {job.imgUrl && (
            <img
              src={job.imgUrl}
              alt="company-logo"
              className="rounded-full w-12 h-12 mr-4"
            />
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {job.jobTitle || "Job title not available"}
            </h2>
            <p className="text-gray-500">{job.companyName || "Company name not available"}</p>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaMapMarkerAlt className="mr-2" />
              <p>
                {job.location || "Location not specified"} • {job.jobType || "Not specified"}
              </p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaBriefcase className="mr-2" />
              <p>
                From {new Date(job.startDate).toLocaleDateString() || "Not specified"} to{" "}
                {job.endDateOrDuration || "Not specified"}
              </p>
            </div>
            <div className="flex items-center text-gray-500 mt-2 text-sm md:text-base">
              <FaDollarSign className="mr-2" />
              <p>{job.salaryDetails || "Not specified"}</p>
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
              />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleApply}
                className={`text-white px-4 py-2 rounded-full font-semibold ${isApplied ? "bg-green-500" : "bg-purple-500 hover:bg-purple-600"
                  }`}
                disabled={isApplied || isUploading}
              >
                {isApplied ? "Applied" : isUploading ? "Uploading..." : "Apply now"}
              </button>

              {/* Skill Analysis Button */}
              <button
                onClick={handleSkillAnalysis}
                className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full font-semibold"
              >
                Skill Analysis
              </button>
            </div>

          </div>
        </div>

        {/* Resume Upload Popup */}
        {showResumePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Resume Required</h2>
              <p className="text-gray-600">Please upload your resume before applying.</p>
              <button
                onClick={() => setShowResumePopup(false)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Limit Reached Popup */}
        {showLimitPopup && (
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

      <hr className="my-4" />

      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">About the job</h3>
        <p className="text-gray-600 leading-relaxed">
          {job.jobDescription || "No description available"}
        </p>
      </div>

      <div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Skills required</h3>
        <div className="flex flex-wrap gap-2">
          {(job.qualifications || []).map((qualification, index) => (
            <span
              key={index}
              className="text-sm bg-gray-200 text-gray-800 py-1 px-3 rounded-full"
            >
              {qualification}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Contact Information</h3>
        <p className="text-gray-600">
          {job.contactInfo?.name || "Not provided"},
          {job.contactInfo?.email || "Not provided"},
          {job.contactInfo?.phone || "Not provided"}
        </p>
      </div>

      {/* Skill Analysis Popup */}
      {showSkillAnalysis && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
            <SkillAnalysis job={job} onClose={closeSkillAnalysis} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyCards;