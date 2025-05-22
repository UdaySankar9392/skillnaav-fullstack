const InternshipSchedule = require('../models/webapp-models/InternshipScheduleModel');

// Create or update a schedule
const updateInternshipSchedule = async (req, res) => {
  try {
    const {
      internshipId,
      partnerId,
      startDate,
      endDate,
      workHours,
      timetable, // array of schedule entries
      defaultStartTime,
      defaultEndTime,
      defaultEventLink,
      defaultLocation,
      defaultType,
      selectedDays
    } = req.body;

    // Basic validation
    if (!internshipId || !partnerId || !startDate || !endDate || !workHours) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize timetable entries
    const sanitizedTimetable = (timetable || []).map(entry => ({
      date: new Date(entry.date),
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      eventLink: entry.eventLink || '',
      type: entry.type || 'online',
      location: (entry.type === 'online') ? null : {
        name: entry.location?.name || '',
        address: entry.location?.address || '',
        mapLink: entry.location?.mapLink || ''
      },
      events: (entry.events || []).map(ev => ({
        description: ev.description,
        type: ev.type || 'online',
        location: (ev.type === 'online') ? null : {
          name: ev.location?.name || '',
          address: ev.location?.address || '',
          mapLink: ev.location?.mapLink || ''
        }
      }))
    }));

    const scheduleData = {
      internshipId,
      partnerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workHours,
      timetable: sanitizedTimetable,
      defaultStartTime,
      defaultEndTime,
      defaultEventLink,
      defaultLocation: {
        name: defaultLocation?.name || '',
        address: defaultLocation?.address || '',
        mapLink: defaultLocation?.mapLink || ''
      },
      defaultType,
      selectedDays
    };

    let schedule = await InternshipSchedule.findOne({ internshipId, partnerId });

    if (schedule) {
      schedule.set(scheduleData); // update existing schedule
    } else {
      schedule = new InternshipSchedule(scheduleData); // create new
    }

    await schedule.save();

    return res.status(200).json({
      message: 'Schedule saved successfully',
      schedule,
    });
  } catch (err) {
    console.error('Schedule Save Error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to save schedule',
    });
  }
};

// Get schedule by internshipId and partnerId
const getInternshipSchedule = async (req, res) => {
  try {
    const { internshipId, partnerId } = req.query;

    if (!internshipId || !partnerId) {
      return res.status(400).json({ error: 'Missing internshipId or partnerId' });
    }

    const schedule = await InternshipSchedule.findOne({ internshipId, partnerId });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    return res.status(200).json(schedule);
  } catch (err) {
    console.error('Fetch Schedule Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to fetch schedule' });
  }
};

module.exports = {
  updateInternshipSchedule,
  getInternshipSchedule,
};
