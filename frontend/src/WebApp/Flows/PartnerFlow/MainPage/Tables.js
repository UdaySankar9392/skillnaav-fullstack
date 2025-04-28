import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";
import SendOfferLetter from "./OfferLetter";

export const ApplicationsTable = ({ applications, onStatusUpdate }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto font-poppins text-sm">
      <thead>
        <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
          <th className="px-6 py-3 text-left">Name</th>
          <th className="px-6 py-3 text-left">Email</th>
          <th className="px-6 py-3 text-left">Applied Date</th>
          <th className="px-6 py-3 text-left">Resume</th>
          <th className="px-6 py-3 text-left">Status</th>
          <th className="px-6 py-3 text-left">Update Status</th>
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {applications.map((student) => (
          <tr key={student._id} className="border-b hover:bg-gray-50 transition">
            <td className="px-6 py-4">{student.userName}</td>
            <td className="px-6 py-4">{student.userEmail}</td>
            <td className="px-6 py-4">{new Date(student.appliedDate).toLocaleDateString()}</td>
            <td className="px-6 py-4">
              <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Resume
              </a>
            </td>
            <td className="px-6 py-4">{student.status || "Pending"}</td>
            <td className="px-6 py-4">
              <select
                value={student.status || "Pending"}
                onChange={(e) => onStatusUpdate(student._id, e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
);

ApplicationsTable.propTypes = {
  applications: PropTypes.array.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};

export const ShortlistedTable = ({ candidates, internshipId, onSendOffer }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (!Array.isArray(candidates)) {
    console.error("ShortlistedTable: candidates is not an array:", candidates);
    return <p className="text-gray-600">No candidates to display.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full font-poppins text-sm bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Resume</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{student.name || "N/A"}</td>
                <td className="px-6 py-4">{student.email || "N/A"}</td>
                <td className="px-6 py-4">
                  <a href={student.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Resume
                  </a>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
                  >
                    Send Offer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {selectedStudent && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <SendOfferLetter
            student={selectedStudent}
            internshipId={internshipId}
            onSuccess={() => setSelectedStudent(null)}
          />
        </div>
      )}
    </div>
  );
};

ShortlistedTable.propTypes = {
  candidates: PropTypes.array.isRequired,
  internshipId: PropTypes.string.isRequired,
  onSendOffer: PropTypes.func,
};

export default ShortlistedTable;
