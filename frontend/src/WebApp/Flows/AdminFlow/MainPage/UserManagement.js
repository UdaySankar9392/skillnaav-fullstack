import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineClose, AiOutlineDownload } from "react-icons/ai";
import jsPDF from "jspdf";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/users");
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = (userId) => {
    setConfirmAction({ type: "approve", userId });
  };

  const handleReject = (userId) => {
    setConfirmAction({ type: "reject", userId });
  };

  const confirmActionHandler = async () => {
    const { type, userId } = confirmAction;
    setConfirmLoading(true);

    try {
      const action = type === "approve" ? "Approved" : "Rejected";
      const response = await axios.patch(`/api/users/${type}/${userId}`, { status: action });

      if (response.status === 200) {
        setUsers(users.map(user => user._id === userId ? { ...user, status: action } : user));
      }
    } catch (err) {
      console.error(`Error ${type} user:`, err.response ? err.response.data : err.message);
      setError(`Failed to ${type} user: ${err.response ? err.response.data.message : err.message}`);
    } finally {
      setConfirmLoading(false);
      setConfirmAction(null);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const downloadPDF = () => {
    if (!selectedUser) return;

    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("User Profile Details", 10, 10);

    doc.text(`Name: ${selectedUser.name || "N/A"}`, 10, 20);
    doc.text(`Email: ${selectedUser.email || "N/A"}`, 10, 30);

    const details = [
      { label: "University Name", value: selectedUser.universityName || "N/A" },
      { label: "Date of Birth", value: selectedUser.dob || "N/A" },
      { label: "Educational Level", value: selectedUser.educationLevel || "N/A" },
      { label: "Field of Study", value: selectedUser.fieldOfStudy || "N/A" },
      { label: "Desired Field", value: selectedUser.desiredField || "N/A" },
    ];

    details.forEach((detail, index) => {
      doc.text(`${detail.label}: ${detail.value}`, 10, 40 + index * 10);
    });

    doc.save("UserProfileDetails.pdf");
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginateNext = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  const paginatePrevious = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

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

  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Pending Student Registrations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">S No.</th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-4 text-sm text-gray-700">{indexOfFirstUser + index + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === "Approved" ? "bg-green-100 text-green-600"
                      : user.status === "Rejected" ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                    onClick={() => handleApprove(user._id)}
                    disabled={user.status === "Approved"}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    onClick={() => handleReject(user._id)}
                    disabled={user.status === "Rejected"}
                  >
                    Reject
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                    onClick={() => handleUserClick(user)}
                  >
                    Details...
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={paginatePrevious}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700">{currentPage} of {totalPages}</span>
        <button
          onClick={paginateNext}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Existing Modal and Confirm Action Components */}
      {/* Modal for user details */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-4 bg-blue-600 text-white rounded-t-lg">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={closeModal} className="text-white">
                <AiOutlineClose size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="mb-2"><strong>Name:</strong> {selectedUser.name}</p>
              <p className="mb-2"><strong>Email:</strong> {selectedUser.email}</p>
              <p className="mb-2"><strong>University Name:</strong> {selectedUser.universityName}</p>
              <p className="mb-2"><strong>Date of Birth:</strong> {selectedUser.dob}</p>
              <p className="mb-2"><strong>Educational Level:</strong> {selectedUser.educationLevel}</p>
              <p className="mb-2"><strong>Field of Study:</strong> {selectedUser.fieldOfStudy}</p>
              <p className="mb-2"><strong>Desired Field:</strong> {selectedUser.desiredField}</p>
              <button
                onClick={downloadPDF}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <AiOutlineDownload className="mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Confirm {confirmAction.type === "approve" ? "Approval" : "Rejection"}
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to {confirmAction.type} this user?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmActionHandler}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={confirmLoading}
              >
                {confirmLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
