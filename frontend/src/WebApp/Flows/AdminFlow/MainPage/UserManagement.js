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
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Pending Student Registrations
      </h2>
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

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-center mb-4 bg-blue-200 p-3 rounded-t">
              User Profile Details
            </h3>
            <div className="bg-green-50 p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">University Name:</label>
                <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter University Details" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">User Dob:</label>
                <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter User Dob" />
                {/* <span className="text-red-500 text-xs">* Required</span> */}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">Educational Level:</label>
                <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter Application Name" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">Field of Study:</label>
                <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter Application Type" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">Desired Field of Intenship:</label>
                <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter Duration" />
              </div>
              {/* <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700">Payment:</label>
          <input type="text" className="border border-gray-300 rounded w-full px-3 py-2 mt-1 text-sm" placeholder="Enter Payment" />
          </div> */}
            </div>
            <div className="flex justify-between p-4 bg-gray-100 rounded-b-lg">
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200" onClick={closeModal}>
                Close
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200">
                Comments
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
                About User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
