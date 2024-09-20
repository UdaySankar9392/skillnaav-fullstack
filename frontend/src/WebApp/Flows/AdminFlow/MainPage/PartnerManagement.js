import React, { useState } from "react";

const PartnerManagement = () => {
  const [partners, setPartners] = useState([
    {
      id: 1,
      name: "Tech Innovations Inc.",
      type: "Company",
      status: "pending",
    },
    { id: 2, name: "Global Finance Co.", type: "Company", status: "pending" },
    {
      id: 3,
      name: "Ivy League University",
      type: "University",
      status: "approved",
    },
    {
      id: 4,
      name: "Future Leaders Academy",
      type: "Institution",
      status: "pending",
    },
    {
      id: 5,
      name: "Creative Arts Institute",
      type: "Institution",
      status: "approved",
    },
    {
      id: 6,
      name: "Green Energy Solutions",
      type: "Company",
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    setPartners(
      partners.map((partner) =>
        partner.id === id ? { ...partner, status: "approved" } : partner
      )
    );
    console.log(`Approved partner with ID: ${id}`);
  };

  const handleReject = (id) => {
    setPartners(partners.filter((partner) => partner.id !== id));
    console.log(`Rejected partner with ID: ${id}`);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Partner Management
      </h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Company Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Type
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
          {partners.map((partner) => (
            <tr
              key={partner.id}
              className="hover:bg-gray-50 transition duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {partner.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {partner.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    partner.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {partner.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {partner.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(partner.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 transition duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(partner.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="text-green-600 font-semibold">Approved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartnerManagement;
