import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faDollarSign, faUsers } from "@fortawesome/free-solid-svg-icons";

const Applications = () => {
  const [internships, setInternships] = useState([]);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch approved internships
        const internshipsResponse = await axios.get("http://localhost:3000/api/interns/approved");
        const internshipsData = internshipsResponse.data;
        setInternships(internshipsData);

        // Only fetch counts if we have internships
        if (internshipsData.length > 0) {
          try {
            // Get comma-separated string of internship IDs
            const internshipIds = internshipsData.map(internship => internship._id).join(',');
            
            // Fetch counts for these internships
            const countsResponse = await axios.get(
              `http://localhost:3000/api/applications/counts`,
              {
                params: { internshipIds },
                paramsSerializer: params => {
                  return `internshipIds=${params.internshipIds}`;
                }
              }
            );
            
            setApplicationCounts(countsResponse.data.counts);
          } catch (countsError) {
            console.error('Error fetching counts:', countsError);
            // Continue even if counts fail - show internships without counts
            setApplicationCounts({});
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load internship data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 font-poppins">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Approved Internships</h2>
      {internships.length === 0 ? (
        <div className="flex flex-col items-center mt-8">
          <img src="/no-data.svg" alt="No internships" className="w-52 mb-4" />
          <p className="text-lg text-gray-500">No approved internships available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship._id} className="bg-white rounded-lg shadow-md p-4 transition-transform transform hover:scale-105">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <img
                    src={internship.imgUrl || "default-image.jpg"}
                    alt={`${internship.companyName} logo`}
                    className="rounded-full w-12 h-12 mr-4 object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{internship.jobTitle}</h3>
                    <p className="text-gray-500">{internship.companyName}</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Approved
                </span>
              </div>
              
              <div className="text-gray-500 text-sm mb-3 space-y-1">
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 w-4" />
                  {internship.location || "N/A"} • {internship.jobType || "N/A"}
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-2 w-4" />
                  {internship.endDateOrDuration || "N/A"}
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faDollarSign} className="mr-2 w-4" />
                  {internship.internshipType === "STIPEND"
                    ? `${internship.compensationDetails?.amount || 'N/A'} ${internship.compensationDetails?.currency || ''} per ${internship.compensationDetails?.frequency?.toLowerCase() || 'month'}`
                    : internship.internshipType === "FREE"
                    ? "Unpaid / Free"
                    : internship.internshipType === "PAID"
                    ? `Student Pays: ${internship.compensationDetails?.amount || 'N/A'} ${internship.compensationDetails?.currency || ''}`
                    : "N/A"}
                </p>
                <p className="flex items-center font-medium">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 w-4" />
                  Applications: {applicationCounts[internship._id] || 0}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {internship.qualifications?.length > 0 ? (
                    internship.qualifications.slice(0, 3).map((qualification, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-800 py-1 px-2 rounded-full">
                        {qualification}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No qualifications listed</span>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;