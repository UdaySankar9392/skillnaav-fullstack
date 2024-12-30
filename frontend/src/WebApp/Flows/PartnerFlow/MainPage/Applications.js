import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faClock, faDollarSign } from "@fortawesome/free-solid-svg-icons";

const InternshipList = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const partnerId = localStorage.getItem("partnerId");

  // Fetch internships posted by the partner
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        if (partnerId) {
          const response = await axios.get(`/api/interns/partner/${partnerId}`);
          console.log("Fetched internships:", response.data);
          setInternships(response.data);
        } else {
          setError("Partner ID not found");
        }
      } catch (err) {
        setError("Error fetching internships");
        console.error("Error fetching internships:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [partnerId]);

  // Function to calculate the posted time
  const calculateDaysAgo = (date) => {
    const postedDate = new Date(date);
    const currentDate = new Date();

    const differenceInTime = currentDate - postedDate; // Difference in milliseconds
    const differenceInHours = Math.floor(differenceInTime / (1000 * 60 * 60)); // Convert to hours
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days

    if (differenceInDays === 0) {
      return differenceInHours === 0
        ? "Just now"
        : differenceInHours === 1
        ? "1 hour ago"
        : `${differenceInHours} hours ago`;
    } else if (differenceInDays === 1) {
      return "Yesterday";
    } else {
      return `${differenceInDays}d ago`;
    }
  };

  if (loading) return <div className="text-center text-lg text-gray-700">Loading internships...</div>;
  if (error) return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Internships Posted by Partner</h2>

      {internships.length > 0 ? (
        internships.map((internship) => (
          <div
            key={internship._id}
            className="mb-6 p-6 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
          >
            {/* Job Image and Company Info */}
            <div className="flex items-center mb-4">
              <img
                src={internship.imgUrl || "https://via.placeholder.com/150"}
                alt={internship.companyName}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold">{internship.jobTitle}</h3>
                <p className="text-gray-600">
                  {internship.companyName} • {calculateDaysAgo(internship.createdAt)}
                </p>
              </div>
            </div>

            {/* Job Details */}
            <div className="text-gray-600 mb-4">
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> {internship.location} • {internship.jobType}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2" />{" "}
                {new Date(internship.startDate).toLocaleDateString()} - {internship.endDateOrDuration}
              </p>
              <p className="flex items-center mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> {internship.salaryDetails}
              </p>
            </div>

            {/* Applied Students Section */}
            <div className="text-gray-700 mt-6">
              <h4 className="text-xl font-semibold">Applied Students:</h4>
              {internship.appliedStudents && internship.appliedStudents.length > 0 ? (
                <ul className="list-disc pl-6">
                  {internship.appliedStudents.map((student) => (
                    <li key={student._id} className="mb-2">
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-gray-600">{student.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No students have applied for this internship yet.</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-lg text-gray-600">No internships found for this partner.</div>
      )}
    </div>
  );
};

export default InternshipList;



// import React, { useState, useEffect } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faMapMarkerAlt, faClock, faDollarSign } from "@fortawesome/free-solid-svg-icons";

// const InternshipList = () => {
//   const [internships, setInternships] = useState([]);

//   useEffect(() => {
//     // Mock data for internships with applied students, status, and resume
//     const mockData = [
//       {
//         _id: "1",
//         jobTitle: "Software Developer Internship",
//         companyName: "Tech Innovators",
//         imgUrl: "https://via.placeholder.com/150",
//         location: "New York, USA",
//         jobType: "Full-time",
//         startDate: "2024-05-01T00:00:00Z",
//         endDateOrDuration: "6 months",
//         salaryDetails: "$1500/month",
//         createdAt: "2024-01-01T00:00:00Z",
//         appliedStudents: [
//           {
//             _id: "s1",
//             name: "John Doe",
//             email: "john.doe@example.com",
//             resume: "https://via.placeholder.com/100x150?text=Resume", // PDF link
//             status: "Pending", // Status of the application
//           },
//           {
//             _id: "s2",
//             name: "Jane Smith",
//             email: "jane.smith@example.com",
//             resume: "https://via.placeholder.com/100x150?text=Resume", // PDF link
//             status: "Pending", // Status of the application
//           },
//         ],
//       },
//       {
//         _id: "2",
//         jobTitle: "Marketing Intern",
//         companyName: "Creative Minds",
//         imgUrl: "https://via.placeholder.com/150",
//         location: "Los Angeles, USA",
//         jobType: "Part-time",
//         startDate: "2024-06-01T00:00:00Z",
//         endDateOrDuration: "3 months",
//         salaryDetails: "$1200/month",
//         createdAt: "2024-02-01T00:00:00Z",
//         appliedStudents: [
//           {
//             _id: "s3",
//             name: "Alice Cooper",
//             email: "alice.cooper@example.com",
//             resume: "https://via.placeholder.com/100x150?text=Resume", // PDF link
//             status: "Pending", // Status of the application
//           },
//           {
//             _id: "s4",
//             name: "Bob Brown",
//             email: "bob.brown@example.com",
//             resume: "https://via.placeholder.com/100x150?text=Resume", // PDF link
//             status: "Pending", // Status of the application
//           },
//         ],
//       },
//     ];

//     setInternships(mockData);
//   }, []);

//   // Function to calculate the posted time
//   const calculateDaysAgo = (date) => {
//     const postedDate = new Date(date);
//     const currentDate = new Date();

//     const differenceInTime = currentDate - postedDate; // Difference in milliseconds
//     const differenceInHours = Math.floor(differenceInTime / (1000 * 60 * 60)); // Convert to hours
//     const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24)); // Convert to days

//     if (differenceInDays === 0) {
//       return differenceInHours === 0
//         ? "Just now"
//         : differenceInHours === 1
//         ? "1 hour ago"
//         : `${differenceInHours} hours ago`;
//     } else if (differenceInDays === 1) {
//       return "Yesterday";
//     } else {
//       return `${differenceInDays}d ago`;
//     }
//   };

//   // Handle changing the application status
//   const handleStatusChange = (internshipId, studentId, newStatus) => {
//     setInternships((prevInternships) =>
//       prevInternships.map((internship) =>
//         internship._id === internshipId
//           ? {
//               ...internship,
//               appliedStudents: internship.appliedStudents.map((student) =>
//                 student._id === studentId ? { ...student, status: newStatus } : student
//               ),
//             }
//           : internship
//       )
//     );
//   };

//   // State to track which internship's applications are visible
//   const [visibleApplications, setVisibleApplications] = useState({});

//   const toggleApplicationsVisibility = (internshipId) => {
//     setVisibleApplications((prevState) => ({
//       ...prevState,
//       [internshipId]: !prevState[internshipId],
//     }));
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
//       <h2 className="text-3xl font-bold text-gray-900 mb-6">Internships Posted by Partner</h2>

//       {internships.length > 0 ? (
//         internships.map((internship) => (
//           <div
//             key={internship._id}
//             className="mb-6 p-6 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
//           >
//             {/* Job Image and Company Info */}
//             <div className="flex items-center mb-4">
//               <img
//                 src={internship.imgUrl || "https://via.placeholder.com/150"}
//                 alt={internship.companyName}
//                 className="w-12 h-12 rounded-full mr-4"
//               />
//               <div>
//                 <h3 className="text-xl font-semibold">{internship.jobTitle}</h3>
//                 <p className="text-gray-600">
//                   {internship.companyName} • {calculateDaysAgo(internship.createdAt)}
//                 </p>
//               </div>
//             </div>

//             {/* Job Details */}
//             <div className="text-gray-600 mb-4">
//               <p className="flex items-center mb-2">
//                 <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> {internship.location} • {internship.jobType}
//               </p>
//               <p className="flex items-center mb-2">
//                 <FontAwesomeIcon icon={faClock} className="mr-2" />{" "}
//                 {new Date(internship.startDate).toLocaleDateString()} - {internship.endDateOrDuration}
//               </p>
//               <p className="flex items-center mb-2">
//                 <FontAwesomeIcon icon={faDollarSign} className="mr-2" /> {internship.salaryDetails}
//               </p>
//             </div>

//             {/* Toggle "See All Applications" Button */}
//             <button
//               onClick={() => toggleApplicationsVisibility(internship._id)}
//               className="text-blue-500 font-semibold mb-4"
//             >
//               {visibleApplications[internship._id] ? "Hide Applications" : "See All Applications"}
//             </button>

//             {/* Applied Students Section */}
//             {visibleApplications[internship._id] && (
//               <div className="text-gray-700 mt-6">
//                 <h4 className="text-xl font-semibold">Applied Students:</h4>
//                 {internship.appliedStudents && internship.appliedStudents.length > 0 ? (
//                   <table className="min-w-full table-auto">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="py-2 px-4 text-left">Name</th>
//                         <th className="py-2 px-4 text-left">Email</th>
//                         <th className="py-2 px-4 text-left">Resume</th>
//                         <th className="py-2 px-4 text-left">Status</th>
//                         <th className="py-2 px-4 text-left">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {internship.appliedStudents.map((student) => (
//                         <tr key={student._id} className="border-b">
//                           <td className="py-2 px-4">{student.name}</td>
//                           <td className="py-2 px-4">{student.email}</td>
//                           <td className="py-2 px-4">
//                             <a href={student.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500">
//                               View Resume
//                             </a>
//                           </td>
//                           <td className="py-2 px-4">{student.status}</td>
//                           <td className="py-2 px-4">
//                             <select
//                               value={student.status}
//                               onChange={(e) => handleStatusChange(internship._id, student._id, e.target.value)}
//                               className="px-2 py-1 bg-gray-200 rounded"
//                             >
//                               <option value="Pending">Pending</option>
//                               <option value="Shortlisted">Shortlisted</option>
//                               <option value="Accepted">Accepted</option>
//                               <option value="Rejected">Rejected</option>
//                             </select>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <p>No students have applied yet.</p>
//                 )}
//               </div>
//             )}
//           </div>
//         ))
//       ) : (
//         <p>No internships posted yet.</p>
//       )}
//     </div>
//   );
// };

// export default InternshipList;
