// utils/buildTimetable.js

/**
 * Create a timetable for selected days with start/end times
 * @param {Array} days - e.g., ['Monday', 'Wednesday', 'Friday']
 * @param {String} startTime - e.g., '10:00 AM'
 * @param {String} endTime - e.g., '4:00 PM'
 * @returns {Array} timetable
 */
function buildTimetable(days, startTime, endTime) {
    return days.map(day => ({
      day,
      startTime,
      endTime,
    }));
  }
  
  module.exports = buildTimetable;
  