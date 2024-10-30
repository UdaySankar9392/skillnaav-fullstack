import React, { useState, useEffect } from "react";
import axios from "axios";

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get("/api/partners/partners");
        setPartners(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleApprove = async () => {
    try {
      await axios.patch(`/api/partners/approve/${confirmAction.partnerId}`, { status: "Approved" });
      setPartners(
        partners.map((partner) =>
          partner._id === confirmAction.partnerId ? { ...partner, status: "Approved" } : partner
        )
      );
      setConfirmAction(null);
    } catch (err) {
      console.error("Error approving partner:", err);
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(`/api/partners/reject/${confirmAction.partnerId}`, { status: "Rejected" });
      setPartners(
        partners.map((partner) =>
          partner._id === confirmAction.partnerId ? { ...partner, status: "Rejected" } : partner
        )
      );
      setConfirmAction(null);
    } catch (err) {
      console.error("Error rejecting partner:", err);
    }
  };

  const confirmActionHandler = () => {
    if (confirmAction.type === "approve") {
      handleApprove();
    } else {
      handleReject();
    }
  };

  const openModal = (partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPartner(null);
  };

  const openConfirmationModal = (partnerId, type) => {
    setConfirmAction({ partnerId, type });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error fetching data: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Pending Partner Registrations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">S No.</th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">University Name</th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.map((partner, index) => (
              <tr key={partner._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-4 text-sm text-gray-700">{index + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.universityName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{partner.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${partner.status === "Approved" ? "bg-green-100 text-green-600"
                      : partner.status === "Rejected" ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {partner.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition duration-200"
                    onClick={() => openModal(partner)}
                  >
                     Details...
                  </button>
                  <button
                    className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition duration-200"
                    onClick={() => openConfirmationModal(partner._id, "approve")}
                    disabled={partner.status === "Approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition duration-200"
                    onClick={() => openConfirmationModal(partner._id, "reject")}
                    disabled={partner.status === "Rejected"}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedPartner && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="bg-blue-500 p-4 rounded-t-lg">
              <h3 className="text-xl font-bold text-white text-center">Partner Details</h3>
            </div>

            <div className="bg-white p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">University Name:</label>
                <input
                  type="text"
                  value={selectedPartner.universityName || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Institution ID:</label>
                <input
                  type="text"
                  value={selectedPartner.institutionId || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end p-4 bg-gray-100 rounded-b-lg space-x-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">
              {`Are you sure you want to ${confirmAction.type} this partner?`}
            </h3>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={confirmActionHandler} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerManagement;
