import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faDollarSign, faTimes } from "@fortawesome/free-solid-svg-icons";

const InternshipList = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState({}); // keyed by internshipId
  const [loadingApplications, setLoadingApplications] = useState({});
  const [shortlistedCandidates, setShortlistedCandidates] = useState({}); // keyed by internshipId
  const [modalData, setModalData] = useState({ open: false, internshipId: null, type: null }); // type: 'applications' or 'shortlisted'

  const partnerId = localStorage.getItem("partnerId");

  // Fetch internships posted by the partner
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        if (partnerId) {
          const response = await axios.get(`/api/interns/partner/${partnerId}`);
          console.log("Fetched internships:", response.data);
          setInternships(response.data);
        } else {
          setError("Partner ID not found");
        }
      } catch (err) {
        setError("No internships posted by partner");
        console.error("Error fetching internships:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [partnerId]);

  // Fetch applications for a specific internship
  const fetchApplications = async (internshipId) => {
    setLoadingApplications((prev) => ({ ...prev, [internshipId]: true }));
    try {
      const response = await axios.get(`/api/applications/internship/${internshipId}`);
      setApplications((prev) => ({
        ...prev,
        [internshipId]: response.data.applications,
      }));
      setModalData({ open: true, internshipId, type: "applications" }); // Open modal to show applications
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApplications((prev) => ({ ...prev, [internshipId]: false }));
    }
  };

  // Handle Shortlisting and show modal with shortlisted candidates
  const handleShortlistCandidates = async (internshipId, jobDescription, jobSkills, resumeFiles) => {
    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("job_skills", JSON.stringify(jobSkills)); // Send skills as JSON string
      resumeFiles.forEach((file) => formData.append("resumes", file)); // Append each resume URL

      // Open the modal with a loading state
      setModalData({ open: true, internshipId, type: "shortlisted", loading: true });

      const response = await axios.post("http://localhost:8001/partner/shortlist", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Shortlist response:", response.data);

      // Map shortlisted candidates with additional fields (name, email, appliedDate)
      const shortlistedWithDetails = response.data.shortlisted_candidates.map((candidate) => {
        const application = applications[internshipId].find(
          (app) => app.resumeUrl === candidate.resumeUrl
        );
        return {
          ...candidate,
          userName: application?.userName || "N/A",
          userEmail: application?.userEmail || "N/A",
          appliedDate: application?.appliedDate || new Date().toISOString(), // Fallback to current date if missing
        };
      });

      // Save the shortlisted candidates under the internship id
      setShortlistedCandidates((prev) => ({
        ...prev,
        [internshipId]: shortlistedWithDetails,
      }));

      // Update modal data to show the results
      setModalData({ open: true, internshipId, type: "shortlisted", loading: false });
    } catch (err) {
      console.error("Error shortlisting candidates:", err);
      setModalData({ open: true, internshipId, type: "shortlisted", loading: false });
    }
  };
  // Function to calculate the posted time
  const calculateDaysAgo = (date) => {
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

  // Update application status
  const updateApplicationStatus = async (internshipId, studentId, status) => {
    try {
      const response = await axios.put(`/api/applications/${studentId}/status`, { status });
      setApplications((prev) => ({
        ...prev,
        [internshipId]: prev[internshipId].map((student) =>
          student._id === studentId ? { ...student, status } : student
        ),
      }));
      console.log("Application status updated:", response.data);
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  if (loading) return <div className="text-center text-lg text-gray-700">Loading internships...</div>;
  if (error) return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Internships Posted by Partner</h2>

      {internships.length > 0 ? (
        internships.map((internship) => (
          <div
            key={internship._id}
            className="mb-6 p-6 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
          >
            {/* Job Image and Company Info */}
            <div className="flex items-center mb-4">
              <img
                src={internship.imgUrl || "https://via.placeholder.com/150"}
                alt={internship.companyName}
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold">{internship.jobTitle}</h3>
                <p className="text-gray-600">
                  {internship.companyName} • {calculateDaysAgo(internship.createdAt)}
                </p>
              </div>
            </div>

            {/* Job Details */}
            <div className="text-gray-600 mb-4">
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> {internship.location} • {internship.jobType}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2" /> {new Date(internship.startDate).toLocaleDateString()} - {internship.endDateOrDuration}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />{" "}
                {internship.internshipType === "STIPEND"
                  ? `${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency} per ${internship.compensationDetails?.frequency?.toLowerCase()}`
                  : internship.internshipType === "FREE"
                    ? "Unpaid / Free"
                    : internship.internshipType === "PAID"
                      ? `Student Pays: ${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency}`
                      : "N/A"}
              </p>
              <p className="mt-2"><strong>Job Description:</strong> {internship.jobDescription || "Not provided"}</p>
              <p className="mt-1"><strong>Qualifications:</strong> {internship.qualifications || "Not provided"}</p>
            </div>

            {/* Buttons */}
            <button
              onClick={() => fetchApplications(internship._id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Applications
            </button>
            <button
              onClick={() =>
                handleShortlistCandidates(
                  internship._id,
                  internship.jobDescription,
                  internship.qualifications || [], // Pass as an array
                  applications[internship._id]?.map((student) => student.resumeUrl)
                )
              }
              className="mt-4 ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Shortlist Candidates
            </button>
          </div>
        ))
      ) : (
        <div className="text-center text-lg text-gray-600">No internships found for this partner.</div>
      )}

      {/* Modal Popup for Applications or Shortlisted Candidates */}
      {
        modalData.open && modalData.internshipId && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-50"></div>
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg p-6 shadow-lg z-10 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setModalData({ open: false, internshipId: null, type: null })}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold mb-4">
                {modalData.type === "applications" ? "Applied Students" : "Shortlisted Candidates"}
              </h2>

              {/* Loading State */}
              {modalData.loading && (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Applied Students Table */}
              {!modalData.loading && modalData.type === "applications" && (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Applied Date</th>
                      <th className="px-4 py-2 text-left">Resume</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications[modalData.internshipId]?.map((student) => (
                      <tr key={student._id} className="border-b">
                        <td className="px-4 py-2">{student.userName}</td>
                        <td className="px-4 py-2">{student.userEmail}</td>
                        <td className="px-4 py-2">
                          {new Date(student.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <a
                            href={student.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline"
                          >
                            View Resume
                          </a>
                        </td>
                        <td className="px-4 py-2">{student.status || "Pending"}</td>
                        <td className="px-4 py-2">
                          <select
                            value={student.status || "Pending"}
                            onChange={(e) =>
                              updateApplicationStatus(modalData.internshipId, student._id, e.target.value)
                            }
                            className="border rounded px-2 py-1"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Shortlisted Candidates Table */}
              {!modalData.loading && modalData.type === "shortlisted" && (
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Applied Date</th>
                      <th className="px-4 py-2 text-left">Resume</th>
                      <th className="px-4 py-2 text-left">Readiness Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortlistedCandidates[modalData.internshipId]?.map((candidate) => {
                      // Find the corresponding application to get student details
                      const application = applications[modalData.internshipId]?.find(
                        (app) => app.resumeUrl === candidate.resumeUrl
                      );

                      return (
                        <tr key={candidate.name} className="border-b">
                          <td className="px-4 py-2">{application?.userName || "N/A"}</td>
                          <td className="px-4 py-2">{application?.userEmail || "N/A"}</td>
                          <td className="px-4 py-2">
                            {application?.appliedDate
                              ? new Date(application.appliedDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <a
                              href={candidate.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 underline"
                            >
                              View Resume
                            </a>
                          </td>
                          <td className="px-4 py-2">{candidate.readiness_score}/100</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )};

    </div>
  );
};

export default InternshipList;
