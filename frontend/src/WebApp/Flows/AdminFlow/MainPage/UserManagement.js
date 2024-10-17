import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.patch(`/api/users/approve/${userId}`, { status: "Approved" });
      setUsers(users.map(user => user._id === userId ? { ...user, status: "Approved" } : user));
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.patch(`/api/users/reject/${userId}`, { status: "Rejected" });
      setUsers(users.map(user => user._id === userId ? { ...user, status: "Rejected" } : user));
    } catch (err) {
      console.error("Error rejecting user:", err);
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
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-center mb-4 bg-blue-200 p-3 rounded-t">User Profile Details</h3>
            <div className="bg-green-50 p-6">
              {/* University Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">University Name:</label>
                <input 
                  type="text" 
                  value={selectedUser.universityName} 
                  readOnly 
                  className="border border-gray-300 rounded w-full px-3 py-2 mt1 text-sm" 
                />
              </div>

              {/* User Dob */}
              <div className="mb4">
                <label className="block text-sm font-semibold text-gray700">User Dob:</label>
                <input 
                  type="text" 
                  value={selectedUser.dob} 
                  readOnly 
                  className="border border-gray300 rounded w-full px3 py2 mt1 text-sm" 
                />
              </div>

              {/* Educational Level */}
              <div className="mb4">
                <label className="block text-sm font-semibold text-gray700">Educational Level:</label>
                <input 
                  type="text" 
                  value={selectedUser.educationLevel} 
                  readOnly 
                  className="border border-gray300 rounded w-full px3 py2 mt1 text-sm" 
                />
              </div>

              {/* Field of Study */}
              <div className="mb4">
                <label className="block text-sm font-semibold text-gray700">Field of Study:</label>
                <input 
                  type="text" 
                  value={selectedUser.fieldOfStudy} 
                  readOnly 
                  className="border border-gray300 rounded w-full px3 py2 mt1 text-sm" 
                />
              </div>

              {/* Desired Field of Internship */}
              <div className="mb4">
                <label className="block text-sm font-semibold text-gray700">Desired Field of Internship:</label>
                <input 
                  type="text" 
                  value={selectedUser.desiredField} 
                  readOnly 
                  className="border border-gray300 rounded w-full px3 py2 mt1 text-sm" 
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-between p4 bg-gray100 rounded-b-lg">
              <button 
                className="px4 py2 bg-red500 text-white rounded hover:bg-red600 transition duration200" 
                onClick={closeModal}
              >
                Close
              </button>
              {/* Additional buttons can be added here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;