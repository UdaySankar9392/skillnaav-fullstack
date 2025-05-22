// src/components/InternshipList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faEye,
  faStar,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import ScheduleForm from "./ScheduleForm";
import { ApplicationsTable, ShortlistedTable } from "./Tables";


const InternshipList = () => {
  // --- Core data state ---
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // --- Applications / Shortlist state ---
  const [applications, setApplications] = useState({});
  const [loadingApplications, setLoadingApplications] = useState({});
  const [shortlistedCandidates, setShortlistedCandidates] = useState({});
  const [modalData, setModalData] = useState({
    open: false,
    internshipId: null,
    type: null, // "applications" or "shortlisted"
    loading: false,
  });

  // --- Offer‐letter overlay state ---
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [joiningDate, setJoiningDate] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [sendingOffer, setSendingOffer] = useState(false);

  // --- Schedule modal state ---
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [selectedInternshipForSchedule, setSelectedInternshipForSchedule] = useState(null);
  

  const partnerId = localStorage.getItem("partnerId");
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 10000,
  });

  // Fetch internships on mount
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        if (!partnerId) throw new Error("Partner ID not found");
        const { data } = await api.get(`/interns/partner/${partnerId}`);
        setInternships(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, [partnerId]);

  // Helper: how many days/hours ago
  const calculateDaysAgo = (date) => {
    const posted = new Date(date);
    const now = new Date();
    const diff = now - posted;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (days === 0) {
      if (hours === 0) return "Just now";
      if (hours === 1) return "1 hour ago";
      return `${hours} hours ago`;
    }
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  // --- Applications handlers ---
  const fetchApplications = async (internshipId) => {
    try {
      setLoadingApplications(prev => ({ ...prev, [internshipId]: true }));
  
      // Fetch applications (assume API returns { applications: [] } if none)
      const { data } = await api.get(`/applications/internship/${internshipId}`);
  
      // Safely set to an array (empty or not)
      setApplications(prev => ({
        ...prev,
        [internshipId]: Array.isArray(data.applications) ? data.applications : []
      }));
  
    } catch (err) {
      console.warn("Could not fetch applications:", err.message);
      // On error, just put an empty array
      setApplications(prev => ({ ...prev, [internshipId]: [] }));
    } finally {
      // In either case, open the modal
      setLoadingApplications(prev => ({ ...prev, [internshipId]: false }));
      setModalData({
        open: true,
        internshipId,
        type: "applications",
        loading: false
      });
    }
  };
  
  // --- Shortlist handlers ---
  const handleShortlist = async (id, description, skills) => {
    try {
      setModalData({ open: true, internshipId: id, type: "shortlisted", loading: true });
      const resumeUrls = (applications[id] || []).map((s) => s.resumeUrl);
      if (!resumeUrls.length) throw new Error("No applications to shortlist");

      const formData = new FormData();
      formData.append("job_description", description);
      formData.append("job_skills", JSON.stringify(skills));
      resumeUrls.forEach((url) => formData.append("resumes", url));
      formData.append("internship_id", id);

      const { data } = await axios.post(
        "http://localhost:8001/partner/shortlist",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setShortlistedCandidates((prev) => ({
        ...prev,
        [id]: data.shortlisted_candidates,
      }));
      setModalData((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      setError(err.message);
      setModalData((prev) => ({ ...prev, loading: false }));
    }
  };

  const showShortlisted = async (internshipId) => {
    try {
      setModalData({ open: true, internshipId, type: "shortlisted", loading: true });
      const { data } = await axios.get(
        `http://localhost:8001/partner/shortlisted/${internshipId}`
      );
      setShortlistedCandidates((prev) => ({
        ...prev,
        [internshipId]: data.shortlisted_candidates,
      }));
      setModalData((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      setError(err.message);
      setModalData((prev) => ({ ...prev, loading: false }));
    }
  };

  // Update application status (Pending/Approved/Rejected)
  const updateApplicationStatus = async (studentId, status) => {
    try {
      await api.put(`/applications/${studentId}/status`, { status });
      setApplications((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = updated[key].map((s) =>
            s._id === studentId ? { ...s, status } : s
          );
        });
        return updated;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Offer letter handlers ---
  const handleSendOffer = (student) => {
    setSelectedStudent({ ...student, internship_id: modalData.internshipId });
    setJoiningDate("");
    setTemplateId("");
    axios
      .get(
        `http://localhost:5000/api/offers/templates?partnerId=${partnerId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then((res) => setTemplates(res.data))
      .catch(console.error);
  };

  const handleSendOfferLetter = async () => {
    if (!templateId || !joiningDate) return alert("Template and joining date required");
    try {
      setSendingOffer(true);
      await api.post(
        `/offers`,
        {
          studentId: selectedStudent._id,
          internshipId: selectedStudent.internship_id,
          templateId,
          joiningDate,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Offer sent successfully!");
      setSelectedStudent(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingOffer(false);
    }
  };

  // --- Schedule handler ---
  const handleSchedule = (internshipId) => {
    setSelectedInternshipForSchedule(internshipId);
    setScheduleFormOpen(true);
  };

  const closeModal = () =>
    setModalData({ open: false, internshipId: null, type: null, loading: false });

  if (loading)
    return <div className="text-center text-lg text-gray-700">Loading internships...</div>;
  if (error)
    return (
      <div className="text-center text-lg text-red-500">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="font-poppins max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Offer-letter overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h2 className="text-lg font-medium mb-4">
              Send Offer to {selectedStudent.name}
            </h2>
            <label className="block mb-2">Joining Date:</label>
            <input
              type="date"
              className="border w-full mb-4 p-2 rounded"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <label className="block mb-2">Select Offer Template:</label>
            <select
              className="border w-full mb-4 p-2 rounded"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="" disabled>
                -- Select Template --
              </option>
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.name || tpl.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setSelectedStudent(null)}
                disabled={sendingOffer}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                  sendingOffer ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSendOfferLetter}
                disabled={sendingOffer}
              >
                {sendingOffer ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">
        Internships Posted by Partner
      </h2>

      {/* Internship Cards */}
      {internships.length === 0 ? (
        <p>No internships posted yet.</p>
      ) : (
        internships.map((internship) => {
          const compensationText =
            internship.internshipType === "STIPEND"
              ? `${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency} per ${internship.compensationDetails?.frequency?.toLowerCase()}`
              : internship.internshipType === "FREE"
              ? "Unpaid / Free"
              : internship.internshipType === "PAID"
              ? `Student Pays: ${internship.compensationDetails?.amount} ${internship.compensationDetails?.currency}`
              : "N/A";

          return (
            <div
              key={internship._id}
              className="mb-6 p-6 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
            >
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
              <div className="text-gray-600 mb-4">
                <p className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />{" "}
                  {internship.location} • {internship.jobType}
                </p>
                <p className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />{" "}
                  {new Date(internship.startDate).toLocaleDateString()} –{" "}
                  {internship.endDateOrDuration}
                </p>
                <p className="flex items-center mb-2">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2" />{" "}
                  {compensationText}
                </p>
                <p className="mt-2">
                  <strong>Job Description:</strong>{" "}
                  {internship.jobDescription || "Not provided"}
                </p>
                <p className="mt-1">
                  <strong>Qualifications:</strong>{" "}
                  {internship.qualifications || "Not provided"}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {/* View Applications */}
                <button
                  onClick={() => fetchApplications(internship._id)}
                  disabled={loadingApplications[internship._id]}
                  className={`flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition duration-200 ${
                    loadingApplications[internship._id] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faEye} /> View Applications
                </button>

                {/* Shortlist */}
                <button
                  onClick={() =>
                    handleShortlist(
                      internship._id,
                      internship.jobDescription,
                      internship.qualifications || []
                    )
                  }
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-500 hover:to-teal-600 transform hover:scale-105 transition duration-200"
                >
                  <FontAwesomeIcon icon={faStar} /> Shortlist
                </button>

                {/* Shortlisted Resumes */}
                <button
                  onClick={() => showShortlisted(internship._id)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition duration-200"
                >
                  <FontAwesomeIcon icon={faDownload} /> Shortlisted Resumes
                </button>

                {/* Schedule */}
                <button
                  onClick={() => handleSchedule(internship._id)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition duration-200"
                >
                  <FontAwesomeIcon icon={faClock} /> Schedule
                </button>
              </div>
            </div>
          );
        })
      )}

  {/* Applications / Shortlisted Modal */}
  <Modal
        isOpen={modalData.open}
        onClose={closeModal}
        title={modalData.type === "applications" ? "Applications" : "Shortlisted Candidates"}
        isLoading={modalData.loading}
      >
       {modalData.type === "applications" && !modalData.loading && (
  (applications[modalData.internshipId] || []).length === 0
    ? <p className="p-6 text-center text-gray-600">No applications yet.</p>
    : <ApplicationsTable
        applications={applications[modalData.internshipId]}
        onStatusUpdate={() => {}}
      />
)}

{modalData.type === "shortlisted" && !modalData.loading && (
  (shortlistedCandidates[modalData.internshipId] || []).length === 0
    ? <p className="p-6 text-center text-gray-600">No candidates shortlisted yet.</p>
    : <ShortlistedTable
        candidates={shortlistedCandidates[modalData.internshipId]}
        internshipId={modalData.internshipId}
        onSendOffer={() => {}}
        onScheduleClick={() => handleSchedule(modalData.internshipId)}
      />
)}

      </Modal>

      {/* Schedule Form Modal */}
      <Modal
        isOpen={scheduleFormOpen}
        onClose={() => setScheduleFormOpen(false)}
        title="Create Internship Schedule"
      >
        {selectedInternshipForSchedule && (
          <ScheduleForm
            internshipId={selectedInternshipForSchedule}
            onClose={() => setScheduleFormOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default InternshipList;
