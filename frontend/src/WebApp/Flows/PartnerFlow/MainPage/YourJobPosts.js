import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const YourJobPosts = () => {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  // Sorting state
  const [sortCriteria, setSortCriteria] = useState("jobTitle");
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

<<<<<<< HEAD
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await axios.get("/api/interns");
        console.log("Fetched internships:", response.data);
        setInternships(response.data);
=======
  const partnerId = localStorage.getItem("partnerId");

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        if (partnerId) {
          const response = await axios.get(`/api/interns/partner/${partnerId}`);
          console.log("Fetched internships:", response.data);
          setInternships(response.data);
        } else {
          console.error("Partner ID not found");
        }
>>>>>>> uday8-1-25
      } catch (error) {
        console.error("Error fetching internships:", error);
      }
    };
<<<<<<< HEAD
    fetchInternships();
  }, []);

=======
  
    fetchInternships();
  }, [partnerId]);
  
>>>>>>> uday8-1-25


  const handleReadMore = (internship) => {
    setSelectedInternship(internship);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };



  const updateField = (field, value) => {
    setSelectedInternship((prev) => {
      const fields = field.split('.'); // Split the field into an array (e.g., "contactInfo.name" -> ["contactInfo", "name"])

      // Create a copy of the previous state to modify
      let updatedInternship = { ...prev };

      let current = updatedInternship; // Start with the top level of the object

      // Traverse through the fields to reach the nested property
      fields.forEach((key, index) => {
        if (index === fields.length - 1) {
          current[key] = value; // Set the final field to the value
        } else {
          if (!current[key]) current[key] = {}; // If the key doesn't exist, create it as an empty object
          current = current[key]; // Move to the next nested level
        }
      });

      return updatedInternship;
    });
  };


  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!selectedInternship) return;

    // Set adminApproved to false when the internship is updated
    const updatedInternship = { ...selectedInternship, adminApproved: false };

    try {
      const response = await axios.put(
        `/api/interns/${updatedInternship._id}`,
        updatedInternship
      );
      console.log("Internship updated:", response.data);

      setInternships((prevInternships) =>
        prevInternships.map((internship) =>
          internship._id === updatedInternship._id ? response.data : internship
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error updating internship:", error);
    }
  };


  // Sorting logic
  const sortInternships = (internships) => {
    return internships.sort((a, b) => {
      const aValue = a[sortCriteria].toLowerCase();
      const bValue = b[sortCriteria].toLowerCase();

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  // Filtering logic
  const filteredInternships = internships.filter((internship) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (internship.jobTitle &&
        internship.jobTitle.toLowerCase().includes(lowerCaseQuery)) ||
      (internship.companyName &&
        internship.companyName.toLowerCase().includes(lowerCaseQuery)) ||
      (internship.organization &&
        internship.organization.toLowerCase().includes(lowerCaseQuery))
    );
  });

  // Pagination logic
  const indexOfLastInternship = currentPage * applicationsPerPage;
  const indexOfFirstInternship = indexOfLastInternship - applicationsPerPage;
  const sortedInternships = sortInternships([...filteredInternships]);
  const currentInternships = sortedInternships.slice(
    indexOfFirstInternship,
    indexOfLastInternship
  );
  const totalPages = Math.ceil(
    filteredInternships.length / applicationsPerPage
  );

  return (
    <div className="p-6 rounded-lg font-poppins shadow-md">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Organization, Role, or Company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-full focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentInternships.map((internship) => (
          <div
            key={internship._id}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            {internship.imgUrl && (
              <img
                src={internship.imgUrl}
                alt={internship.jobTitle}
                className="mb-4 w-full h-40 object-contain rounded-lg"
              />
            )}

            <h3 className="text-xl font-semibold mb-2">
              {internship.jobTitle}
            </h3>
            <p className="mb-1">
              <strong>Company:</strong> {internship.companyName}
            </p>
            <p className="mb-1">
              <strong>Location:</strong> {internship.location}
            </p>
            <p className="mb-1">
              <strong>Stipend/Salary:</strong> {internship.salaryDetails}
            </p>
            <p className="mb-1">
              <strong>Duration:</strong> {internship.duration}
            </p>
            <div className="mt-4">
              <strong>Status:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded-full font-bold ${internship.adminReviewed
                    ? "bg-yellow-200 text-yellow-800"  // In review status
                    : internship.adminApproved
                      ? "bg-green-200 text-green-800"   // Approved status
                      : "bg-red-200 text-red-800"       // Not approved status
                  }`}
              >
                {internship.adminReviewed
                  ? "In Review"                      // Show 'In Review' when adminReviewed is true
                  : internship.adminApproved
                    ? "Approved"                       // Show 'Approved' when adminApproved is true
                    : "Not Approved"                   // Show 'Not Approved' otherwise
                }
              </span>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                onClick={() => handleReadMore(internship)}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="self-center text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* Internship Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Internship Details"
        className="fixed font-poppins inset-0 z-[1000] flex items-center justify-center overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[999]"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full z-[1000] overflow-y-auto max-h-[90vh]">
          {selectedInternship && (
            <form onSubmit={handleUpdateJob}>
              <h2 className="text-2xl font-semibold mb-4">Update Internship Details</h2>

              {/* Job Title */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={selectedInternship.jobTitle || ""}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={selectedInternship.companyName || ""}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={selectedInternship.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Job Type */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Job Type</label>
                <input
                  type="text"
                  value={selectedInternship.jobType || ""}
                  onChange={(e) => updateField("jobType", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Job Description */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Job Description</label>
                <textarea
                  value={selectedInternship.jobDescription || ""}
                  onChange={(e) => updateField("jobDescription", e.target.value)}
                  className="p-2 border rounded w-full"
                  rows={3}
                />
              </div>

              {/* Start Date */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={selectedInternship.startDate || ""}
                  onChange={(e) => updateField("startDate", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* End Date / Duration */}
              <div className="mb-4">
                <label className="block font-medium mb-1">End Date / Duration</label>
                <input
                  type="date"
                  value={selectedInternship.endDateOrDuration || ""}
                  onChange={(e) => updateField("endDateOrDuration", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Duration */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={selectedInternship.duration || ""}
                  onChange={(e) => updateField("duration", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Stipend/Salary */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Stipend/Salary</label>
                <input
                  type="text"
                  value={selectedInternship.salaryDetails || ""}
                  onChange={(e) => updateField("salaryDetails", e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>

              {/* Qualifications */}
              <div className="mb-4">
                <label className="block font-medium mb-1">Qualifications</label>
                <textarea
                  value={selectedInternship.qualifications || ""}
                  onChange={(e) => updateField("qualifications", e.target.value)}
                  className="p-2 border rounded w-full"
                  rows={3}
                />
              </div>

              {/* Contact Info Fields */}
              <h3 className="text-lg font-semibold mt-6 mb-2">Contact Info</h3>

              <input
                type="text"
                value={selectedInternship.contactInfo?.name || ""}
                onChange={(e) => updateField("contactInfo.name", e.target.value)} // Update nested field
                className="p-2 border rounded w-full"
              />

              <input
                type="email"
                value={selectedInternship.contactInfo?.email || ""}
                onChange={(e) => updateField("contactInfo.email", e.target.value)} // Update nested field
                className="p-2 border rounded w-full"
              />

              <input
                type="text"
                value={selectedInternship.contactInfo?.phone || ""}
                onChange={(e) => updateField("contactInfo.phone", e.target.value)} // Update nested field
                className="p-2 border rounded w-full"
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default YourJobPosts;
