// // components/OfferLetterCard.js
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   faMapMarkerAlt,
//   faClock,
//   faDollarSign,
//   faCalendarAlt,
//   faChevronDown,
//   faChevronUp
// } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { formatDistanceToNow, format } from "date-fns";

// const OfferLetterCard = ({ offer, onStatusChange }) => {
//   const [job, setJob] = useState(null);
//   const [loadingJob, setLoadingJob] = useState(true);
//   const [errorJob, setErrorJob] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [responseType, setResponseType] = useState(null);
//   const [schedule, setSchedule] = useState(null);
//   const [loadingSchedule, setLoadingSchedule] = useState(false);
//   const [showSchedule, setShowSchedule] = useState(false);

//   // Validate and fetch internship details
//   useEffect(() => {
//     if (!offer.internshipId) {
//       console.error("Offer missing internshipId:", offer);
//       setErrorJob("No internship ID found. Please contact support.");
//       setLoadingJob(false);
//       return;
//     }

//     axios
//       .get(`/api/interns/${offer.internshipId}`)
//       .then(res => setJob(res.data))
//       .catch(err => {
//         console.error("Failed to fetch internship:", err);
//         setErrorJob("Could not load internship details");
//       })
//       .finally(() => setLoadingJob(false));
//   }, [offer]);

//   // Fetch schedule only after job loads and offer is accepted
//   useEffect(() => {
//     if (!job || offer.status.toLowerCase() !== "accepted") return;

//     const fetchSchedule = async () => {
//   setLoadingSchedule(true);
//   try {
//     // partnerId is required by the schedule endpoint
//     const partnerId = job.partnerId || job.postedBy || job.companyId;
//     if (!partnerId) {
//       console.error("Missing partnerId on job:", job);
//       throw new Error("Partner ID not found");
//     }

//     const res = await axios.get(`/api/schedule/get-schedule`, {
//       params: {
//         internshipId: offer.internshipId,
//         partnerId,
//       },
//     });
//     setSchedule(res.data);
//   } catch (err) {
//     console.error("Failed to fetch schedule:", err);
//   } finally {
//     setLoadingSchedule(false);
//   }
// };

//     fetchSchedule();
//   }, [job, offer.status]);

//   const handleRespond = type => {
//     setResponseType(type);
//     setShowModal(true);
//   };

//   const confirmRespond = async () => {
//     if (!responseType) return;
//     try {
//       await axios.patch(`/api/offer-letters/${offer._id}/status`, {
//         status: responseType
//       });
//       onStatusChange(responseType);
//       setShowModal(false);
//       setResponseType(null);
//     } catch {
//       alert("Failed to update status.");
//     }
//   };

//   const renderSchedule = () => {
//     if (loadingSchedule) return <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-pulse">Loading schedule...</div>;
//     if (!schedule) return <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">No schedule available yet. Check back later.</div>;

//     return (
//       <div className="mt-4 border-t pt-4">
//         <h4 className="font-medium text-gray-700 mb-3 flex items-center">
//           <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500" />
//           Internship Schedule
//         </h4>
//         <div className="space-y-3">
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Start Date:</span>
//             <span className="font-medium">{format(new Date(schedule.startDate), "MMMM d, yyyy")}</span>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">End Date:</span>
//             <span className="font-medium">{format(new Date(schedule.endDate), "MMMM d, yyyy")}</span>
//           </div>
//           <div className="flex justify-between text-sm">
//             <span className="text-gray-600">Work Hours:</span>
//             <span className="font-medium">{schedule.workHours}</span>
//           </div>
//           {schedule.timetable?.length > 0 && (
//             <div className="mt-3">
//               <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scheduled Sessions</h5>
//               <div className="space-y-2">
//                 {schedule.timetable.slice(0, showSchedule ? undefined : 3).map((session, idx) => (
//                   <div key={idx} className="p-3 bg-gray-50 rounded-lg">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-medium text-gray-800">{format(new Date(session.date), "EEEE, MMM d")}</p>
//                         <p className="text-sm text-gray-600">{session.startTime} - {session.endTime}</p>
//                       </div>
//                       {session.eventLink && <a href={session.eventLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Join Meeting</a>}
//                     </div>
//                     {session.events?.length > 0 && (
//                       <ul className="mt-2 pl-4 space-y-1">
//                         {session.events.map((ev, i) => <li key={i} className="text-xs text-gray-600 flex items-start"><span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></span>{ev}</li>)}
//                       </ul>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               {schedule.timetable.length > 3 && (
//                 <button onClick={() => setShowSchedule(!showSchedule)} className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
//                   {showSchedule ? <><FontAwesomeIcon icon={faChevronUp} className="mr-1" />Show Less</> : <><FontAwesomeIcon icon={faChevronDown} className="mr-1" />Show All {schedule.timetable.length} Sessions</>}
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   if (loadingJob) return <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse h-64" />;
//   if (errorJob) return <p className="text-red-500">{errorJob}</p>;

//   const timeAgo = formatDistanceToNow(new Date(offer.sentDate), { addSuffix: true });
//   const stipendDisplay = job.internshipType === "STIPEND" ? `${job.compensationDetails.amount} ${job.compensationDetails.currency} / ${job.compensationDetails.frequency.toLowerCase()}` : job.internshipType === "FREE" ? "Unpaid / Free" : "N/A";

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-4">
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative">
//             <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm {responseType === "Accepted" ? "Acceptance" : "Rejection"}</h2>
//             <p className="text-sm text-gray-600 mb-4">Are you sure you want to <span className="font-medium text-indigo-600">{responseType?.toLowerCase()}</span> this offer?</p>
//             <div className="flex justify-center gap-3 mt-4">
//               <button onClick={confirmRespond} className={`px-4 py-2 rounded-lg text-white transition ${responseType === "Accepted" ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600" : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"}`}>Yes, {responseType}</button>
//               <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center">
//           <img src={job.imgUrl || "/default-image.jpg"} alt="Company Logo" className="w-12 h-12 rounded-full mr-4 object-contain" />
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800">{job.jobTitle}</h3>
//             <p className="text-sm text-gray-500">{job.companyName} · {timeAgo}</p>
//           </div>
//         </div>
//         <span className={`text-xs font-medium px-3 py-1 rounded-full ${offer.status === "Accepted" ? "bg-green-100 text-green-700" : offer.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{offer.status}</span>
//       </div>

//       {/* DETAILS */}
//       <div className="text-gray-600 text-sm mb-3 space-y-1">
//         <p className="flex items-center"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />{job.location || "Remote"}</p>
//         <p className="flex items-center"><FontAwesomeIcon icon={faClock} className="mr-2" />{format(new Date(job.startDate), "dd MMM yyyy")} – {job.endDateOrDuration ? format(new Date(job.endDateOrDuration), "dd MMM yyyy") : "—"}</p>
//         <p className="flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />{stipendDisplay}</p>
//       </div>

//       {/* QUALIFICATIONS */}
//       <div className="flex flex-wrap gap-2 mb-4">
//         {job.qualifications?.length > 0 ? job.qualifications.map((q, i) => <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{q}</span>) : <span className="text-xs text-gray-500">No qualifications</span>}
//       </div>

//       {/* SCHEDULE (post-acceptance) */}
//       {offer.status.toLowerCase() === "accepted" && renderSchedule()}

//       {/* ACTIONS */}
//       {offer.status.toLowerCase() === "sent" && (
//         <div className="flex gap-2 mt-4">
//           <button onClick={() => handleRespond("Accepted")} className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition">Accept</button>
//           <button onClick={() => handleRespond("Rejected")} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition">Reject</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OfferLetterCard;



// components/OfferLetterCard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  faMapMarkerAlt,
  faClock,
  faDollarSign,
  faCalendarAlt,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDistanceToNow, format, parseISO } from "date-fns";

const OfferLetterCard = ({ offer, onStatusChange }) => {
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseType, setResponseType] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);


  // Validate and fetch internship details
  useEffect(() => {
    if (!offer.internshipId) {
      console.error("Offer missing internshipId:", offer);
      setErrorJob("No internship ID found. Please contact support.");
      setLoadingJob(false);
      return;
    }

    axios
      .get(`/api/interns/${offer.internshipId}`)
      .then(res => setJob(res.data))
      .catch(err => {
        console.error("Failed to fetch internship:", err);
        setErrorJob("Could not load internship details");
      })
      .finally(() => setLoadingJob(false));
  }, [offer]);

  // Fetch schedule only after job loads and offer is accepted
  useEffect(() => {
    if (!job || offer.status.toLowerCase() !== "accepted") return;

    const fetchSchedule = async () => {
      setLoadingSchedule(true);
      try {
        // partnerId is required by the schedule endpoint
        const partnerId = job.partnerId || job.postedBy || job.companyId;
        if (!partnerId) {
          console.error("Missing partnerId on job:", job);
          throw new Error("Partner ID not found");
        }

        const res = await axios.get(`/api/schedule/get-schedule`, {
          params: {
            internshipId: offer.internshipId,
            partnerId,
          },
        });
        setSchedule(res.data);
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [job, offer.status]);

  const handleRespond = type => {
    setResponseType(type);
    setShowModal(true);
  };

  const normalizeUrl = url => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
  };


  const confirmRespond = async () => {
    if (!responseType) return;
    try {
      await axios.patch(`/api/offer-letters/${offer._id}/status`, {
        status: responseType
      });
      onStatusChange(responseType);
      setShowModal(false);
      setResponseType(null);
    } catch {
      alert("Failed to update status.");
    }
  };

  const renderSchedule = () => {
    if (loadingSchedule) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-pulse">
          <p className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <p key={i} className="h-3 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      );
    }

    if (!schedule) {
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center text-blue-600">
          <p>Your schedule will be shared by the company soon.</p>
        </div>
      );
    }

    const renderSession = (session, index) => {
      return (
        <div key={index} className="p-4 hover:bg-gray-50 border-b border-gray-100">
          <div className="flex items-start">
            {/* Date Section */}
            <div className="w-16 text-center">
              <p className="text-xs text-gray-500">{format(parseISO(session.date), "EEE")}</p>
              <p className="font-semibold text-lg text-gray-800">{format(parseISO(session.date), "d")}</p>
            </div>

            {/* Session Details */}
            <div className="ml-4 flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-800">
                {session.startTime} - {session.endTime} &nbsp;
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${session.type === 'online'
                    ? 'bg-blue-100 text-blue-700'
                    : session.type === 'offline'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                  {session.type}
                </span>
              </p>

              {/* Event Link (if online/hybrid) */}
              {session.eventLink && session.type !== 'offline' && (
                <a
                  href={normalizeUrl(session.eventLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs inline-block bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                >
                  Join Meeting
                </a>
              )}


              {/* Location (if offline/hybrid) */}
              {(session.location?.address && session.type !== 'online') && (
                <p className="text-xs text-gray-600">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                  {session.location.name}, {session.location.address}
                </p>
              )}

              {/* Events (manual additions) */}
              {session.events?.length > 0 && (
                <div className="text-xs text-gray-500">
                  <ul className="list-disc ml-4 mt-1">
                    {session.events.map((ev, idx) =>
                      typeof ev === 'string' ? (
                        <li key={idx}>{ev}</li>
                      ) : (
                        <li key={idx}>
                          {ev.description}
                          {ev.type && (
                            <span className={`ml-2 px-1 py-0.5 rounded-full text-[10px] capitalize ${ev.type === 'online'
                                ? 'bg-blue-100 text-blue-700'
                                : ev.type === 'offline'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                              {ev.type}
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="mt-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="font-medium text-sm">{format(parseISO(schedule.startDate), "MMM d, yyyy")}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-500">End Date</p>
            <p className="font-medium text-sm">{format(parseISO(schedule.endDate), "MMM d, yyyy")}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-500">Work Hours</p>
            <p className="font-medium text-sm">{schedule.workHours}</p>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-lg border">
          <div className="p-3 bg-gray-50 border-b">
            <h4 className="font-medium text-sm flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500" />
              Internship Sessions ({schedule.timetable.length})
            </h4>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {schedule.timetable.map(renderSession)}
          </div>
        </div>
      </div>
    );
  };


  if (loadingJob) return <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse h-64" />;
  if (errorJob) return <p className="text-red-500">{errorJob}</p>;

  const timeAgo = formatDistanceToNow(new Date(offer.sentDate), { addSuffix: true });
  const stipendDisplay = job.internshipType === "STIPEND" ? `${job.compensationDetails.amount} ${job.compensationDetails.currency} / ${job.compensationDetails.frequency.toLowerCase()}` : job.internshipType === "FREE" ? "Unpaid / Free" : "N/A";

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm {responseType === "Accepted" ? "Acceptance" : "Rejection"}</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to <span className="font-medium text-indigo-600">{responseType?.toLowerCase()}</span> this offer?</p>
            <div className="flex justify-center gap-3 mt-4">
              <button onClick={confirmRespond} className={`px-4 py-2 rounded-lg text-white transition ${responseType === "Accepted" ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600" : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"}`}>Yes, {responseType}</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img src={job.imgUrl || "/default-image.jpg"} alt="Company Logo" className="w-12 h-12 rounded-full mr-4 object-contain" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{job.jobTitle}</h3>
            <p className="text-sm text-gray-500">{job.companyName} · {timeAgo}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${offer.status === "Accepted" ? "bg-green-100 text-green-700" : offer.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{offer.status}</span>
      </div>

      {/* DETAILS */}
      <div className="text-gray-600 text-sm mb-3 space-y-1">
        <p className="flex items-center"><FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />{job.location || "Remote"}</p>
        <p className="flex items-center"><FontAwesomeIcon icon={faClock} className="mr-2" />{format(new Date(job.startDate), "dd MMM yyyy")} – {job.endDateOrDuration ? format(new Date(job.endDateOrDuration), "dd MMM yyyy") : "—"}</p>
        <p className="flex items-center"><FontAwesomeIcon icon={faDollarSign} className="mr-2" />{stipendDisplay}</p>
      </div>

      {/* QUALIFICATIONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.qualifications?.length > 0 ? job.qualifications.map((q, i) => <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{q}</span>) : <span className="text-xs text-gray-500">No qualifications</span>}
      </div>

      {/* SCHEDULE (post-acceptance) */}
      {offer.status.toLowerCase() === "accepted" && (
        <div className="mt-4">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2"
          >
            View Schedule
          </button>
        </div>
      )}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500" />
              Internship Schedule
            </h2>
            {renderSchedule()}
          </div>
        </div>
      )}



      {/* ACTIONS */}
      {offer.status.toLowerCase() === "sent" && (
        <div className="flex gap-2 mt-4">
          <button onClick={() => handleRespond("Accepted")} className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition">Accept</button>
          <button onClick={() => handleRespond("Rejected")} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition">Reject</button>
        </div>
      )}
    </div>
  );
};

export default OfferLetterCard;
