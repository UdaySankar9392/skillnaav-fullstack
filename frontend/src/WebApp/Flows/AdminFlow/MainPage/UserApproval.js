import React, { useState, useEffect } from "react";
import axios from "axios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/users");
        setUsers(response.data.users); // Set users
        const token = response.data.token; // Get token from response
        // Optionally store the token in localStorage or state
        localStorage.setItem("token", token); // Store token
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    const userToUpdate = users.find((user) => user._id === userId);
    if (userToUpdate) {
      // Optimistically update the UI
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, adminApproved: true } : user
        )
      );

      try {
        // Make a PUT request to approve the user
        const response = await axios.put(`/api/users/approve/${userId}`, {
          adminApproved: true, // You can send the updated value if needed
        });
        console.log("Response from server:", response.data);
      } catch (err) {
        console.error("Error approving user:", err);
        // Rollback optimistic update on error
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, adminApproved: false } : user
          )
        );
      }
    }
  };

  const handleReject = async (userId) => {
    const userToUpdate = users.find((user) => user._id === userId);
    if (userToUpdate) {
      try {
        const updatedUser = { ...userToUpdate, adminApproved: false };
        await axios.put(`/api/users/${userId}`, updatedUser);
        setUsers(
          users.map((user) => (user._id === userId ? updatedUser : user))
        );
      } catch (err) {
        console.error("Error rejecting user:", err);
      }
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
    return (
      <div className="text-center text-red-500">
        Error fetching data: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Pending Student Registrations
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                S No.
              </th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-20 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 transition duration-200"
              >
                <td
                  className="px-4 py-4 text-sm text-gray-700"
                  onClick={() => handleUserClick(user)}
                >
                  {index + 1}
                </td>
                <td
                  className="px-6 py-4 text-sm font-medium text-gray-900"
                  onClick={() => handleUserClick(user)}
                >
                  {user.name}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-700"
                  onClick={() => handleUserClick(user)}
                >
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.adminApproved
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {user.adminApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    className={`px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 ${
                      user.adminApproved ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleApprove(user._id)}
                    disabled={user.adminApproved}
                  >
                    Approve
                  </button>
                  <button
                    className={`px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 ${
                      !user.adminApproved ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleReject(user._id)}
                    disabled={!user.adminApproved}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold text-center mb-4 bg-blue-200 p-3 rounded-t">
              User Profile Details
            </h3>
            <div className="bg-green-50 p-6 rounded-b-lg">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  University Name:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm"
                  value={selectedUser.universityName}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Date of Birth:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm"
                  value={new Date(selectedUser.dob).toLocaleDateString()}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Education Level:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm"
                  value={selectedUser.educationLevel}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Field of Study:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm"
                  value={selectedUser.fieldOfStudy}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Desired Field:
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm"
                  value={selectedUser.desiredField}
                  readOnly
                />
              </div>
            </div>
            <div className="flex justify-end p-4">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
