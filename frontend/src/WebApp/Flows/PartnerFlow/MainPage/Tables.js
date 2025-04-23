import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";
import SendOfferLetter from "./OfferLetter";

export const ApplicationsTable = ({ applications, onStatusUpdate }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Email</th>
          <th className="px-4 py-2 text-left">Applied Date</th>
          <th className="px-4 py-2 text-left">Resume</th>
          <th className="px-4 py-2 text-left">Status</th>
          <th className="px-4 py-2 text-left">Update Status</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((student) => (
          <tr key={student._id} className="border-b">
            <td className="px-4 py-2">{student.userName}</td>
            <td className="px-4 py-2">{student.userEmail}</td>
            <td className="px-4 py-2">{new Date(student.appliedDate).toLocaleDateString()}</td>
            <td className="px-4 py-2">
              <a
                href={student.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline"
              >
                View Resume
              </a>
            </td>
            <td className="px-4 py-2">{student.status || "Pending"}</td>
            <td className="px-4 py-2">
              <select
                value={student.status || "Pending"}
                onChange={(e) => onStatusUpdate(student._id, e.target.value)}
                className="border rounded px-2 py-1"
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((student) => (
              <tr key={student._id}>
                <td className="px-6 py-4 whitespace-nowrap">{student.name || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.email || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={student.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Resume
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      console.log("Sending offer to:", student);
                      console.log("With internshipId:", internshipId);
                      setSelectedStudent(student);
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
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
