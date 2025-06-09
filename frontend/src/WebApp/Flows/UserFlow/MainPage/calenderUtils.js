// calendarUtils.js
import { createEvents } from "ics";

/**
 * Given an array of “session” objects (your schedule.timetable),
 * generate a downloadable .ics file that contains one event per session.
 *
 * Each session object must have:
 *   - date        (string, "YYYY-MM-DD")
 *   - startTime   (string, e.g. "09:00 AM" or "14:30")
 *   - endTime     (string, e.g. "11:00 AM" or "16:00")
 *   - sectionSummary  (string, optional description)
 *   - instructor  (string or { name: string })
 *   - type        ("online"|"offline"|"hybrid")
 *   - eventLink   (string, optional—URL if it’s an online session)
 *   - location    (object with { name, address, mapLink } if offline/hybrid)
 *
 * Returns: a Blob URL that you can assign to an <a href=... download> link.
 */
export function buildIcsFileFromSchedule(schedule) {
  if (!schedule || !Array.isArray(schedule.timetable)) return null;

  // 1) Turn each session into an ics-event object
  const events = schedule.timetable.map((session) => {
    // Helper to parse "YYYY-MM-DD" + "hh:mm AM/PM" or "HH:mm" into an array [YYYY, M, D, H, M]
    function parseDateParts(dateStr, timeStr) {
      // If timeStr includes AM/PM:
      const hasAmPm = /[AaPp][Mm]$/.test(timeStr.trim());
      let dt;

      if (hasAmPm) {
        // parse "yyyy-MM-dd hh:mm a"
        // We’ll let the JS Date constructor parse it loosely, then extract parts:
        dt = new Date(`${dateStr} ${timeStr}`);
      } else {
        // Assume 24-hour "HH:mm"
        const [hour24, minute24] = timeStr.split(":").map((n) => parseInt(n, 10));
        const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));
        dt = new Date(year, month - 1, day, hour24, minute24);
      }
      // Return [YYYY, M (1–12), D (1–31), H (0–23), Min]
      return [
        dt.getFullYear(),
        dt.getMonth() + 1,
        dt.getDate(),
        dt.getHours(),
        dt.getMinutes(),
      ];
    }

    // 2) Build the “start” and “end” arrays
    const startArray = parseDateParts(session.date, session.startTime || "");
    const endArray = parseDateParts(session.date, session.endTime || "");

    // 3) Construct title/description
    const title = `Internship: ${session.sectionSummary || "Session"}`;
    const instructorName =
      typeof session.instructor === "string"
        ? session.instructor
        : session.instructor?.name || "";
    let description = "";
    if (instructorName) {
      description += `Instructor: ${instructorName}\n`;
    }
    if (session.sectionSummary) {
      description += `Summary: ${session.sectionSummary}\n`;
    }
    description += `Type: ${session.type}\n`;

    // 4) Location: if online, use eventLink; if offline/hybrid, use name/address
    let locationField = "";
    if (session.type === "online" && session.eventLink) {
      locationField = session.eventLink;
    } else if (
      (session.type === "offline" || session.type === "hybrid") &&
      session.location?.address
    ) {
      locationField = `${session.location.name}, ${session.location.address}`;
    }
return {
  title,
  start: startArray,
  end: endArray,
  description,
  location:
    session.type === "offline" || session.type === "hybrid"
      ? `${session.location?.name || ""}, ${session.location?.address || ""}`
      : undefined, // <-- No location for online events
  url: session.eventLink || undefined, // <-- Correct field for online URLs
};

  });

  // 5) Use ics.createEvents to turn these into a single iCal string
  const { error, value } = createEvents(events);

  if (error) {
    console.error("Error creating ICS:", error);
    return null;
  }

  // 6) Create a Blob and ObjectURL so the user can download it
  const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);

  return blobUrl; // e.g. "blob:https://.../abc123"
}