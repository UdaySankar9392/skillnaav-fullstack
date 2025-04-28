// components/OfferLetterCard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDistanceToNow } from "date-fns";
import { format } from "date-fns";


const OfferLetterCard = ({ offer, onStatusChange }) => {
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
const [responseType, setResponseType] = useState(null);


  // Fetch internship details
  useEffect(() => {
    axios
      .get(`/api/interns/${offer.internshipId}`)
      .then(res => setJob(res.data))
      .catch(err => {
        console.error("Failed to fetch internship:", err);
        setErrorJob("Could not load internship details");
      })
      .finally(() => setLoadingJob(false));
  }, [offer.internshipId]);

  const handleRespond = (type) => {
    setResponseType(type);
    setShowModal(true);
  };
  
  const confirmRespond = async () => {
    if (!responseType) return;
  
    try {
      await axios.patch(`/api/offer-letters/${offer._id}/status`, {
        status: responseType,
      });
      onStatusChange(responseType);
      setShowModal(false);
      setResponseType(null);
    } catch {
      alert("Failed to update status.");
    }
  };
  

  if (loadingJob) {
    return <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse h-64" />;
  }
  if (errorJob) {
    return <p className="text-red-500">{errorJob}</p>;
  }

  const timeAgo = formatDistanceToNow(new Date(offer.sentDate), {
    addSuffix: true,
  });

  const stipendDisplay =
    job.internshipType === "STIPEND"
      ? `${job.compensationDetails.amount} ${job.compensationDetails.currency} / ${job.compensationDetails.frequency.toLowerCase()}`
      : job.internshipType === "FREE"
      ? "Unpaid / Free"
      : "N/A";

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Confirm {responseType === "Accepted" ? "Acceptance" : "Rejection"}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to{" "}
        <span className="font-medium text-indigo-600">
          {responseType?.toLowerCase()}
        </span>{" "}
        this offer?
      </p>
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={confirmRespond}
          className={`px-4 py-2 rounded-lg text-white transition 
            ${
              responseType === "Accepted"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            }`}
        >
          Yes, {responseType}
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src={job.imgUrl || "/default-image.jpg"}
            alt="Company Logo"
            className="w-12 h-12 rounded-full mr-4 object-contain"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {job.jobTitle}
            </h3>
            <p className="text-sm text-gray-500">
              {job.companyName} · {timeAgo}
            </p>
          </div>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
          {offer.status}
        </span>
      </div>

      {/* DETAILS ROW */}
      <div className="text-gray-600 text-sm mb-3 space-y-1">
        <p className="flex items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
          {job.location || "Remote"}
        </p>
        <p className="flex items-center">
  <FontAwesomeIcon icon={faClock} className="mr-2" />
  {format(new Date(job.startDate), "dd MMM yyyy")} –{" "}
  {job.endDateOrDuration ? format(new Date(job.endDateOrDuration), "dd MMM yyyy") : "—"}
</p>

        <p className="flex items-center">
          <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
          {stipendDisplay}
        </p>
      </div>

      {/* QUALIFICATIONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.qualifications.length > 0 ? (
          job.qualifications.map((q, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {q}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">No qualifications</span>
        )}
      </div>

      {/* ACTION BUTTONS */}
      {offer.status.toLowerCase() === "sent" && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespond("Accepted")}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Accept
          </button>
          <button
            onClick={() => handleRespond("Rejected")}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default OfferLetterCard;
