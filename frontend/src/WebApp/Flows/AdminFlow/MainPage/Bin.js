import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaUndo } from 'react-icons/fa';

const BinManagement = () => {
  const [deletedInternships, setDeletedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);

  useEffect(() => {
    const fetchDeletedInternships = async () => {
      try {
        const response = await axios.get("/api/interns/bin");
        setDeletedInternships(response.data);
      } catch (error) {
        setError("Failed to load deleted internships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedInternships();
  }, []);

  const handleRestore = async () => {
    try {
      await axios.patch(`api/interns/${selectedInternship._id}/restore`, { deleted: false });
      setDeletedInternships((prevInternships) =>
        prevInternships.filter((i) => i._id !== selectedInternship._id)
      );
      setShowModal(false);
    } catch (error) {
      setError("Failed to restore internship. Please try again.");
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await axios.delete(`api/interns/${selectedInternship._id}/permanent`);
      setDeletedInternships((prevInternships) =>
        prevInternships.filter((i) => i._id !== selectedInternship._id)
      );
      setShowModal(false);
    } catch (error) {
      setError("Failed to permanently delete internship. Please try again.");
    }
  };

  const openModal = (type, internship) => {
    setModalType(type);
    setSelectedInternship(internship);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInternship(null);
    setModalType(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 rounded-lg shadow-md bg-gray-100 font-poppins text-sm">
      <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">Bin - Deleted Internships</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {deletedInternships.length === 0 && (
        <div className="text-center text-gray-500 mt-4">No deleted internships found in the bin.</div>
      )}

      <table className="min-w-full bg-white rounded-lg shadow-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">S.No</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Job Title</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Company</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Location</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Stipend</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deletedInternships.map((internship, index) => (
            <tr key={internship._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{internship.jobTitle}</td>
              <td className="px-4 py-2">{internship.companyName}</td>
              <td className="px-4 py-2">{internship.location}</td>
              <td className="px-4 py-2">{internship.stipend}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-700"
                  onClick={() => openModal("restore", internship)}
                >
                  <FaUndo className="inline mr-2" /> Restore
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-700"
                  onClick={() => openModal("delete", internship)}
                >
                  <FaTrashAlt className="inline mr-2" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4">
              {modalType === "restore"
                ? "Restore Internship"
                : "Permanently Delete Internship"}
            </h3>
            <p className="mb-4">
              Are you sure you want to{" "}
              {modalType === "restore" ? "restore" : "permanently delete"}{" "}
              this internship?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${
                  modalType === "restore"
                    ? "bg-green-500 hover:bg-green-700"
                    : "bg-red-500 hover:bg-red-700"
                } text-white rounded-md`}
                onClick={
                  modalType === "restore" ? handleRestore : handlePermanentDelete
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinManagement;
