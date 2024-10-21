import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const PartnerApproval = () => {
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [partnerToReject, setPartnerToReject] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const partnersPerPage = 10;

  // Sorting state
  const [sortCriteria, setSortCriteria] = useState("name"); // Update to your actual field name
  const [sortDirection, setSortDirection] = useState("asc");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get("/api/partners/partners");
        console.log("Fetched partners:", response.data);
        setPartners(response.data);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };
    fetchPartners();
  }, []);

  const handleApprove = async (partnerId) => {
    try {
      console.log("Approving partner ID:", partnerId);
      const response = await axios.patch(`/api/partners/${partnerId}/approve`, {
        status: "approved",
      });

      console.log("Partner approved:", response.data);
      // Update the partners state with the approved partner
      setPartners((prevPartners) =>
        prevPartners.map((partner) =>
          partner._id === partnerId
            ? { ...partner, adminApproved: true } // Set adminApproved to true
            : partner
        )
      );
    } catch (error) {
      console.error("Error approving partner:", error);
    }
  };

  const handleRejectClick = (partner) => {
    setPartnerToReject(partner);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!partnerToReject) return;

    try {
      console.log("Rejecting partner ID:", partnerToReject._id);
      await axios.delete(`/api/partners/${partnerToReject._id}`);

      // Remove partner from state
      setPartners((prevPartners) =>
        prevPartners.filter((partner) => partner._id !== partnerToReject._id)
      );

      console.log("Partner rejected and deleted successfully");
      setIsRejectModalOpen(false);
    } catch (error) {
      console.error("Error rejecting partner:", error);
    }
  };

  const handleReadMore = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  // Sorting logic
  const sortPartners = (partners) => {
    return partners.sort((a, b) => {
      const aValue = a[sortCriteria]?.toLowerCase();
      const bValue = b[sortCriteria]?.toLowerCase();

      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  // Filtering logic
  const filteredPartners = partners.filter((partner) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      (partner.name && partner.name.toLowerCase().includes(lowerCaseQuery)) ||
      (partner.companyName &&
        partner.companyName.toLowerCase().includes(lowerCaseQuery)) ||
      (partner.organization &&
        partner.organization.toLowerCase().includes(lowerCaseQuery))
    );
  });

  // Pagination logic
  const indexOfLastPartner = currentPage * partnersPerPage;
  const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
  const sortedPartners = sortPartners([...filteredPartners]);
  const currentPartners = sortedPartners.slice(
    indexOfFirstPartner,
    indexOfLastPartner
  );
  const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);

  return (
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
        Admin Dashboard - Posted Partners
      </h2>
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
      {/* Sorting Controls */}
      <div className="flex mb-4">
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value)}
          className="mr-4 p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        >
          <option value="name">Sort by Name</option>
          <option value="companyName">Sort by Company</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:ring focus:ring-indigo-300"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Company
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Location
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentPartners.map((partner) => (
            <tr
              key={partner._id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4">{partner.name}</td>
              <td className="px-6 py-4">{partner.companyName}</td>
              <td className="px-6 py-4">{partner.location}</td>
              <td className="px-6 py-4 flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    partner.adminApproved
                      ? "bg-green-500"
                      : "bg-blue-500 hover:bg-blue-700"
                  }`}
                  onClick={() => handleApprove(partner._id)}
                  disabled={partner.adminApproved}
                >
                  {partner.adminApproved ? "Approved" : "Approve"}
                </button>
                <button
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => handleReadMore(partner)}
                >
                  Read More
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => handleRejectClick(partner)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

      {/* Partner Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Partner Details"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">{selectedPartner?.name}</h2>
          {/* Display partner details here */}
          <p>{selectedPartner?.description}</p>
          {/* Add more details as needed */}
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onRequestClose={closeRejectModal}
        contentLabel="Reject Partner"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4">Reject Partner</h2>
          <p>Are you sure you want to reject {partnerToReject?.name}?</p>
          <div className="mt-4">
            <button
              onClick={confirmReject}
              className="mr-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Confirm
            </button>
            <button
              onClick={closeRejectModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerApproval;
