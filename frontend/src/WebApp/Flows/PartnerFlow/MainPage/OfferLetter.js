// components/SendOfferLetter.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSpinner } from "@fortawesome/free-solid-svg-icons";

const SendOfferLetter = ({ student, internshipId, onSuccess }) => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [internship, setInternship] = useState(null);
  const [offerDetails, setOfferDetails] = useState({
    joiningDate: "",
    position: ""
  });

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/api/interns/${internshipId}`,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}` 
            } 
          }
        );
        
        if (!response.data) {
          throw new Error("No data received");
        }
        
        setInternship(response.data);
        setOfferDetails(prev => ({
          ...prev,
          position: response.data.jobTitle
        }));
        
      } catch (err) {
        console.error("Error fetching internship:", err);
        setError(err.response?.data?.message || "Failed to load internship details");
      }
    };

    if (internshipId) {
      fetchInternship();
    }
  }, [internshipId]);

  const handleSendOffer = async () => {
    try {
      setIsSending(true);
      setError(null);

      // Validate required fields
      if (!student?._id || !offerDetails.joiningDate || !internshipId || !internship) {
        throw new Error("Missing required information");
      }

      const response = await axios.post(
        "http://localhost:5000/api/offer-letters",
        {
          student_id: student.student_id,
          name: student.name,
          email: student.email,
          position: offerDetails.position,
          startDate: offerDetails.joiningDate,
          internshipId: internshipId,
          companyName: internship.companyName,
          location: internship.location,
          duration: internship.duration,
          stipend: internship.compensationDetails,
          jobDescription: internship.jobDescription,
          qualifications: internship.qualifications,
          contactInfo: internship.contactInfo
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess(true);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send offer letter");
    } finally {
      setIsSending(false);
    }
  };

  if (!internshipId) {
    return <div className="text-red-500">No internship ID provided</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
        <button 
          className="ml-2 text-blue-500 underline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (success) {
    return <div className="text-green-500">Offer sent successfully!</div>;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium mb-2">Send Offer Letter</h4>
      
      {!internship ? (
        <div className="flex items-center justify-center p-4">
          <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          Loading internship details...
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="font-medium">{internship.jobTitle}</p>
            <p>Company: {internship.companyName}</p>
            <p>Location: {internship.location}</p>
            <p>Duration: {internship.duration}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                type="text"
                value={offerDetails.position}
                onChange={(e) => setOfferDetails({
                  ...offerDetails,
                  position: e.target.value
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Joining Date
              </label>
              <input
                type="date"
                value={offerDetails.joiningDate}
                onChange={(e) => setOfferDetails({
                  ...offerDetails,
                  joiningDate: e.target.value
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <button
            onClick={handleSendOffer}
            disabled={isSending || !offerDetails.position || !offerDetails.joiningDate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
          >
            {isSending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Sending...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                Send Offer
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default SendOfferLetter;