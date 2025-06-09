import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineClose, AiOutlineSearch, AiOutlineDownload } from "react-icons/ai";
import jsPDF from "jspdf";

const UserManagement = () => {
  // ————————————————————————
  // HOOKS: always define at top
  // ————————————————————————
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // ————————————————————————
  // Token setup & validity check
  // ————————————————————————
  const raw = localStorage.getItem("adminToken");
  const isValidToken = raw && raw.split(".").length === 3;

  useEffect(() => {
    if (!isValidToken) return;

    axios.defaults.headers.common["Authorization"] = `Bearer ${raw}`;
    
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/api/users/users");
        setUsers(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isValidToken, raw]);

  const handleApprove = (userId) => setConfirmAction({ type: "approve", userId });
  const handleReject = (userId) => setConfirmAction({ type: "reject", userId });

  const confirmActionHandler = async () => {
    const { type, userId } = confirmAction;
    setConfirmLoading(true);

    try {
      await axios.patch(
        `/api/users/${type}/${userId}`,
        { status: type === "approve" ? "Approved" : "Rejected" }
      );
      setUsers((u) =>
        u.map((usr) =>
          usr._id === userId
            ? { ...usr, status: type === "approve" ? "Approved" : "Rejected" }
            : usr
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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

    const fields = [
      ["University Name", selectedUser.universityName],
      ["Date of Birth", selectedUser.dob],
      ["Educational Level", selectedUser.educationLevel],
      ["Field of Study", selectedUser.fieldOfStudy],
      ["Desired Field", selectedUser.desiredField],
    ];
    fields.forEach(([label, val], i) =>
      doc.text(`${label}: ${val || "N/A"}`, 10, 40 + i * 10)
    );
    doc.save("UserProfileDetails.pdf");
  };

  const idxLast = currentPage * usersPerPage;
  const idxFirst = idxLast - usersPerPage;
  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const current = filtered.slice(idxFirst, idxLast);
  const total = Math.ceil(filtered.length / usersPerPage);
  const next = () => setCurrentPage((p) => Math.min(p + 1, total));
  const prev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  if (!isValidToken) {
    return (
      <div className="text-center text-red-500 p-6">
        Unauthorized: no valid session found. Please{" "}
        <a href="/login" className="underline">log in</a>.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Student Applications for Approval
      </h2>

      {/* Search */}
      <div className="mb-4 flex justify-center items-center relative w-full max-w-3xl">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-12 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <AiOutlineSearch size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600" />
        {searchQuery && (
          <AiOutlineClose
            size={20}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            onClick={() => setSearchQuery("")}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              {["S No.", "Name", "Email", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {current.map((user, i) => (
              <tr key={user._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-700">{idxFirst + i + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === "Approved"
                      ? "bg-green-100 text-green-600"
                      : user.status === "Rejected"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-4">
                  <button
                    onClick={() => handleApprove(user._id)}
                    disabled={user.status === "Approved"}
                    className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(user._id)}
                    disabled={user.status === "Rejected"}
                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUserClick(user)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600"
                  >
                    Details...
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={prev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-600">
          Page {currentPage} of {total}
        </span>
        <button
          onClick={next}
          disabled={currentPage === total}
          className={`px-4 py-2 rounded ${
            currentPage === total ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg p-6 w-96 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
              <AiOutlineClose size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">User Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>University:</strong> {selectedUser.universityName || "N/A"}</p>
              <p><strong>DOB:</strong> {selectedUser.dob || "N/A"}</p>
              <p><strong>Level:</strong> {selectedUser.educationLevel || "N/A"}</p>
              <p><strong>Field:</strong> {selectedUser.fieldOfStudy || "N/A"}</p>
              <p><strong>Desired:</strong> {selectedUser.desiredField || "N/A"}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={downloadPDF} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                <AiOutlineDownload className="inline mr-1" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold">
              Are you sure you want to {confirmAction.type} this user?
            </h3>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={confirmActionHandler}
                disabled={confirmLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                {confirmLoading ? "Processing..." : "Yes"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;