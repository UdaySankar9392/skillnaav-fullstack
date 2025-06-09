// OfferLetterCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  faMapMarkerAlt,
  faLink,
  faDollarSign,
  faCalendarAlt,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  formatDistanceToNow,
  format,
  parseISO,
  isValid,
} from "date-fns";

// ─── Google Calendar URL Helper ─────────────────────────────────────────
function buildGoogleCalendarUrl({
  title,
  startDate,
  endDate,
  location,
  description = "",
}) {
  const startUTC = format(startDate, "yyyyMMdd'T'HHmmss'Z'");
  const endUTC = format(endDate, "yyyyMMdd'T'HHmmss'Z'");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startUTC}/${endUTC}`,
    details: description,
    location: location || "",
    sf: "true",
    output: "xml",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Parse “YYYY-MM-DD” + “hh:mm AM/PM” or “HH:mm” into a JS Date ─────
function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return new Date(NaN);

  const hasAmPm = /[AaPp][Mm]$/.test(timeStr.trim());
  let dt;

  if (hasAmPm) {
    dt = new Date(`${dateStr} ${timeStr}`);
  } else {
    const [hour24, minute24] = timeStr.split(":").map((n) => parseInt(n, 10));
    const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
    dt = new Date(year, month - 1, day, hour24, minute24);
  }

  return dt;
}

const OfferLetterCard = ({ offer, onStatusChange }) => {
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [errorJob, setErrorJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [responseType, setResponseType] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // ─── 1) Fetch internship details ───────────────────────────────────
  useEffect(() => {
    if (!offer.internshipId) {
      console.error("Offer missing internshipId:", offer);
      setErrorJob("No internship ID found. Please contact support.");
      setLoadingJob(false);
      return;
    }

    axios
      .get(`/api/interns/${offer.internshipId}`)
      .then((res) => setJob(res.data))
      .catch((err) => {
        console.error("Failed to fetch internship:", err);
        setErrorJob("Could not load internship details");
      })
      .finally(() => setLoadingJob(false));
  }, [offer]);

  // ─── 2) Fetch schedule after job loads & offer is accepted ────────
  useEffect(() => {
    if (!job || offer.status.toLowerCase() !== "accepted") return;

    const fetchSchedule = async () => {
      setLoadingSchedule(true);
      try {
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

  const handleRespond = (type) => {
    setResponseType(type);
    setShowModal(true);
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  const confirmRespond = async () => {
    if (!responseType) return;
    try {
      await axios.patch(`/api/offer-letters/${offer._id}/status`, {
        status: responseType,
      });
      onStatusChange(responseType);
      setShowModal(false);
      setResponseType(null);
    } catch {
      alert("Failed to update status.");
    }
  };

  // ─── 3) Render the schedule with table + per‐row Google Calendar links ─
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

    const getInstructorName = (instr) => {
      if (!instr) return "";
      return typeof instr === "string" ? instr : instr.name || "";
    };

    return (
      <div className="mt-4 space-y-6">
        {/* ── Top‐Level Summary Cards ──────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500">Start Date</p>
            <p className="mt-1 font-medium text-gray-800">
              {format(parseISO(schedule.startDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500">End Date</p>
            <p className="mt-1 font-medium text-gray-800">
              {format(parseISO(schedule.endDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500">Work Hours</p>
            <p className="mt-1 font-medium text-gray-800">
              {schedule.workHours}
            </p>
          </div>
        </div>

        {/* ── Per‐Session Table ─────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-indigo-50 border-b border-indigo-200">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Date</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Day</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Time</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Instructor</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Summary</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Meeting Link</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-600">Type</th>
              </tr>
            </thead>

            <tbody>
              {schedule.timetable.map((session, idx) => {
                const instructorName = getInstructorName(session.instructor);
                const summaryText = session.sectionSummary || "-";
                const isOnline = session.type === "online";
                const isOffline = session.type === "offline";

                // ── Parse start/end into JS Date objects ────────────
                const startDateTime = parseDateTime(session.date, session.startTime || "");
                const endDateTime = parseDateTime(session.date, session.endTime || "");
                const canBuildCalendar =
                  isValid(startDateTime) && isValid(endDateTime);

                let gcalUrl = "";
                if (canBuildCalendar) {
                  const title = `Internship Session: ${session.sectionSummary || "Session"}`;
                  const locationForGc =
                    isOnline && session.eventLink
                      ? normalizeUrl(session.eventLink)
                      : session.location?.address
                        ? `${session.location.name}, ${session.location.address}`
                        : "";
                  const description = `
Instructor: ${instructorName}
Summary: ${summaryText}
Type: ${session.type}
                  `.trim();

                  gcalUrl = buildGoogleCalendarUrl({
                    title,
                    startDate: startDateTime,
                    endDate: endDateTime,
                    location: locationForGc,
                    description,
                  });
                }

                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {format(parseISO(session.date), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {format(parseISO(session.date), "EEE")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {session.startTime} - {session.endTime}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {instructorName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                      {summaryText}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {isOnline ? (
                        session.eventLink ? (
                          <a
                            href={normalizeUrl(session.eventLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          >
                            <FontAwesomeIcon icon={faLink} className="mr-1" />
                            Join Meeting
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">Link Pending</span>
                        )
                      ) : isOffline ? (
                        session.location?.address ? (
                          <p className="inline-flex items-center">
                            <FontAwesomeIcon
                              icon={faMapMarkerAlt}
                              className="mr-1 text-gray-600"
                            />
                            <span className="text-gray-700 text-sm">
                              {session.location.name}, {session.location.address}
                            </span>
                          </p>
                        ) : (
                          <span className="text-gray-400 text-xs">Location TBD</span>
                        )
                      ) : (
                        // Hybrid
                        <>
                          {session.eventLink && (
                            <a
                              href={normalizeUrl(session.eventLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-xs font-medium mr-2"
                            >
                              <FontAwesomeIcon icon={faLink} className="mr-1" />
                              Join Meeting
                            </a>
                          )}
                          {session.location?.address && (
                            <p className="inline-flex items-center">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-1 text-gray-600"
                              />
                              <span className="text-gray-700 text-sm">
                                {session.location.name}
                              </span>
                            </p>
                          )}
                          {!session.eventLink && !session.location?.address && (
                            <span className="text-gray-400 text-xs">TBD</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`
                          inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full capitalize
                          ${isOnline
                            ? "bg-blue-100 text-blue-700"
                            : isOffline
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                          }
                        `}
                      >
                        {session.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── 4) “Loading” / “Error” / Header / Details / Actions ───────
  if (loadingJob)
    return <div className="bg-white rounded-lg shadow-lg p-4 animate-pulse h-64" />;
  if (errorJob) return <p className="text-red-500">{errorJob}</p>;

  // ─── Fix for “Invalid time value” ─────────────────────────────────
  let timeAgo;
  if (offer.sentDate) {
    // Try to parse ISO string
    const parsedSent = parseISO(offer.sentDate);
    if (isValid(parsedSent)) {
      timeAgo = formatDistanceToNow(parsedSent, { addSuffix: true });
    } else {
      // Fallback if parseISO returned invalid
      timeAgo = "Date unknown";
    }
  } else {
    // Fallback if no sentDate provided
    timeAgo = "Date unknown";
  }

  const stipendDisplay =
    job.internshipType === "STIPEND"
      ? `${job.compensationDetails.amount} ${job.compensationDetails.currency} / ${job.compensationDetails.frequency.toLowerCase()}`
      : job.internshipType === "FREE"
        ? "Unpaid / Free"
        : "N/A";

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm {responseType === "Accepted" ? "Acceptance" : "Rejection"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to{" "}
              <span className="font-medium text-indigo-600">
                {responseType?.toLowerCase()}
              </span>{" "}
              this offer?
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={confirmRespond}
                className={`px-4 py-2 rounded-lg text-white transition ${responseType === "Accepted"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  }`}
              >
                Yes, {responseType}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <img
            src={job.imgUrl || "/default-image.jpg"}
            alt="Company Logo"
            className="w-12 h-12 rounded-full mr-4 object-contain"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {job.jobTitle}
            </h3>
            <p className="text-sm text-gray-500">
              {job.companyName} · {timeAgo}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${offer.status === "Accepted"
              ? "bg-green-100 text-green-700"
              : offer.status === "Rejected"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
        >
          {offer.status}
        </span>
      </div>

      {/* DETAILS */}
      <div className="text-gray-600 text-sm mb-3 space-y-1">
        <p className="flex items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
          {job.location || "Remote"}
        </p>
        <p className="flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2" />
          {format(new Date(job.startDate), "dd MMM yyyy")} –{" "}
          {job.endDateOrDuration
            ? format(new Date(job.endDateOrDuration), "dd MMM yyyy")
            : "—"}
        </p>
        <p>
          <FontAwesomeIcon icon={faDollarSign} />
          {job.internshipType === "STIPEND"
            ? `${job.compensationDetails?.amount} ${job.compensationDetails?.currency} per ${job.compensationDetails?.frequency?.toLowerCase()}`
            : job.internshipType === "FREE"
              ? "Unpaid / Free"
              : job.internshipType === "PAID"
                ? `Student Pays: ${job.compensationDetails?.amount} ${job.compensationDetails?.currency}`
                : "N/A"
          }
        </p>
      </div>

      {/* QUALIFICATIONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.qualifications?.length > 0 ? (
          job.qualifications.map((q, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {q}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500">No qualifications</span>
        )}
      </div>

      {/* VIEW SCHEDULE BUTTON */}
      {offer.status.toLowerCase() === "accepted" && (
        <div className="mt-4">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2"
          >
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-1 text-indigo-500"
            />
            View Schedule
          </button>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="mr-2 text-indigo-500"
              />
              Internship Schedule
            </h2>
            {renderSchedule()}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      {offer.status.toLowerCase() === "sent" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleRespond("Accepted")}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition"
          >
            Accept
          </button>
          <button
            onClick={() => handleRespond("Rejected")}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default OfferLetterCard;