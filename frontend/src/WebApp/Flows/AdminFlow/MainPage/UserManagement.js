import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // For confirmation modal
  const [confirmLoading, setConfirmLoading] = useState(false); // Loading state for confirmation modal

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
    setConfirmLoading(true); // Start loading

    try {
      const action = type === "approve" ? "Approved" : "Rejected";
      // Make sure to adjust the API endpoint if necessary
      const response = await axios.patch(`/api/users/${type}/${userId}`, { status: action });

      // Check if the request was successful
      if (response.status === 200) {
        setUsers(users.map(user => user._id === userId ? { ...user, status: action } : user));
      }
    } catch (err) {
      console.error(`Error ${type} user:`, err.response ? err.response.data : err.message);
      setError(`Failed to ${type} user: ${err.response ? err.response.data.message : err.message}`);
    } finally {
      setConfirmLoading(false); // End loading
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
            {users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-4 text-sm text-gray-700" onClick={() => handleUserClick(user)}>
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900" onClick={() => handleUserClick(user)}>
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700" onClick={() => handleUserClick(user)}>
                  {user.email}
                </td>
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
                    disabled={user.status === "Approved"} // Disable if already approved
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                    onClick={() => handleReject(user._id)}
                    disabled={user.status === "Rejected"} // Disable if already rejected
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for User Profile Details */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="bg-blue-500 p-4 rounded-t-lg">
              <h3 className="text-xl font-bold text-white text-center">User Profile Details</h3>
            </div>
            <div className="bg-white p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">University Name:</label>
                <input
                  type="text"
                  value={selectedUser.universityName || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Date of Birth:</label>
                <input
                  type="text"
                  value={selectedUser.dob || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Educational Level:</label>
                <input
                  type="text"
                  value={selectedUser.educationLevel || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Field of Study:</label>
                <input
                  type="text"
                  value={selectedUser.fieldOfStudy || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Desired Field:</label>
                <input
                  type="text"
                  value={selectedUser.desiredField || 'N/A'}
                  readOnly
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button onClick={closeModal} className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-center mb-4">
              {confirmAction.type === "approve" ? "Approve User" : "Reject User"}
            </h3>
            <p className="text-center">
              Are you sure you want to {confirmAction.type} this user?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmActionHandler}
                className={`px-4 py-2 rounded ${confirmLoading ? "bg-gray-400" : (confirmAction.type === "approve" ? "bg-green-500" : "bg-red-500")} text-white`}
                disabled={confirmLoading} // Disable button if loading
              >
                {confirmLoading ? "Processing..." : (confirmAction.type === "approve" ? "Approve" : "Reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
