// src/components/ScheduleForm.js
import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiLink, FiPlus, FiCheck, FiChevronRight, FiX, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import * as XLSX from 'xlsx';

const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const internshipTypes = ['online', 'offline', 'hybrid'];

const ScheduleForm = ({ internshipId, onClose }) => {
  // Form fields
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    workHours: '',
    defaultStartTime: '',
    defaultEndTime: '',
    defaultEventLink: '',
    defaultLocation: {
      name: '',
      address: '',
      mapLink: ''
    },
    defaultType: '',
    selectedDays: allWeekdays.slice(),
    newDate: ''
  });

  const [error, setError] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [previewed, setPreviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualEvent, setManualEvent] = useState({
    date: '',
    description: '',
    type: 'online',
    location: {
      name: '',
      address: '',
      mapLink: ''
    }
  });
  const [excelData, setExcelData] = useState({});

  useEffect(() => {
    axios.get(`/api/interns/${internshipId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(({ data }) => {
        setForm(f => ({
          ...f,
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDateOrDuration).toISOString().split('T')[0],
          defaultType: data.type || 'online'
        }));
      })
      .catch(err => setError(err.message));
  }, [internshipId]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('/api/schedule/get-schedule', {
          params: { internshipId, partnerId: localStorage.getItem('partnerId') }
        });
        const data = response.data;
        setForm(f => ({
          ...f,
          startDate: data.startDate.slice(0, 10),
          endDate: data.endDate.slice(0, 10),
          workHours: data.workHours,
          defaultStartTime: data.timetable[0]?.startTime || '',
          defaultEndTime: data.timetable[0]?.endTime || '',
          defaultEventLink: data.timetable[0]?.eventLink || '',
          defaultType: data.timetable[0]?.type || 'online',
          defaultLocation: data.timetable[0]?.location || {
            name: '',
            address: '',
            mapLink: ''
          }
        }));

        setTimetable(data.timetable.map(entry => ({
          date: entry.date.slice(0, 10),
          day: entry.day,
          selected: true,
          startTime: entry.startTime,
          endTime: entry.endTime,
          eventLink: entry.eventLink || '',
          type: entry.type || 'online',
          location: entry.location || {
            name: '',
            address: '',
            mapLink: ''
          },
          events: entry.events || []
        })));
        setPreviewed(true);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Error loading schedule');
        }
      }
    };
    fetchSchedule();
  }, [internshipId]);

  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setForm(f => ({
        ...f,
        defaultLocation: {
          ...f.defaultLocation,
          [field]: value
        }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleMEChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('meLocation.')) {
      const field = name.split('.')[1];
      setManualEvent(me => ({
        ...me,
        location: {
          ...me.location,
          [field]: value
        }
      }));
    } else {
      setManualEvent(me => ({ ...me, [name]: value }));
    }
  };

  const toggleWeekday = day => setForm(f => {
    const sel = new Set(f.selectedDays);
    sel.has(day) ? sel.delete(day) : sel.add(day);
    return { ...f, selectedDays: Array.from(sel) };
  });

  const generatePreview = () => {
    const { startDate, endDate, defaultStartTime, defaultEndTime, defaultEventLink, defaultType, defaultLocation, selectedDays } = form;
    if (!startDate || !endDate || !defaultStartTime || !defaultEndTime) {
      return setError('Fill dates and default times');
    }
    if (!selectedDays.length) {
      return setError('Select at least one day');
    }
    if ((defaultType === 'offline' || defaultType === 'hybrid') && !defaultLocation.address) {
      return setError('Location address is required for offline/hybrid internships');
    }

    const days = [];
    let dayCounter = 1;

    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleString('en-us', { weekday: 'long' });

      if (selectedDays.includes(dayName)) {
        const key = `Day - ${dayCounter}`;
        const excelEntry = excelData[key];

        days.push({
          date: d.toISOString().split('T')[0],
          day: dayName,
          selected: true,
          startTime: defaultStartTime,
          endTime: defaultEndTime,
          eventLink: excelEntry?.link || defaultEventLink,
          type: excelEntry?.type || defaultType,
          location:
            (excelEntry?.type === "offline" || excelEntry?.type === "hybrid")
              ? {
                name: excelEntry?.location || '',
                address: excelEntry?.location || '',
                mapLink: ''
              }
              : defaultLocation,
          sectionSummary: excelEntry?.summary || "",
          events: []
        });

        dayCounter++;
      }
    }

    setTimetable(days);
    setPreviewed(true);
    setError(null);
  };

  const toggleDay = idx => setTimetable(tt => {
    const copy = [...tt];
    copy[idx].selected = !copy[idx].selected;
    return copy;
  });

  const changeField = (idx, field, val) => setTimetable(tt => {
    const copy = [...tt];
    copy[idx][field] = val;
    return copy;
  });

  const changeLocationField = (idx, field, val) => setTimetable(tt => {
    const copy = [...tt];
    copy[idx].location = {
      ...copy[idx].location,
      [field]: val
    };
    return copy;
  });

  const addManualEvent = () => {
    const { date, description, type, location } = manualEvent;
    if (!date || !description) return;
    if ((type === 'offline' || type === 'hybrid') && !location.address) {
      return setError('Location address is required for offline/hybrid events');
    }

    setTimetable(tt => tt.map(d =>
      d.date === date ? {
        ...d,
        events: [...d.events, {
          description,
          type,
          location: type === 'online' ? null : location
        }]
      } : d
    ));
    setManualEvent({
      date: '',
      description: '',
      type: 'online',
      location: {
        name: '',
        address: '',
        mapLink: ''
      }
    });
  };

  const addNewDay = () => {
    const { newDate, defaultStartTime, defaultEndTime, defaultEventLink, defaultType, defaultLocation, startDate, endDate } = form;
    if (!newDate) return setError('Pick a date');
    if (newDate < startDate || newDate > endDate) {
      return setError(`Date must be between ${startDate} and ${endDate}`);
    }
    if ((defaultType === 'offline' || defaultType === 'hybrid') && !defaultLocation.address) {
      return setError('Location address is required for offline/hybrid days');
    }

    const name = new Date(newDate).toLocaleString('en-us', { weekday: 'long' });
    setTimetable(tt => [
      ...tt,
      {
        date: newDate,
        day: name,
        selected: true,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        eventLink: defaultEventLink,
        type: defaultType,
        location: defaultType === 'online' ? null : defaultLocation,
        events: []
      }
    ]);
    setForm(f => ({ ...f, newDate: '' }));
    setError(null);
  };

  const saveSchedule = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        internshipId,
        partnerId: localStorage.getItem('partnerId'),
        startDate: form.startDate,
        endDate: form.endDate,
        workHours: form.workHours,
        defaultStartTime: form.defaultStartTime,
        defaultEndTime: form.defaultEndTime,
        defaultEventLink: form.defaultEventLink,
        defaultLocation: form.defaultType === 'online' ? null : form.defaultLocation,
        defaultType: form.defaultType,
        selectedDays: form.selectedDays,
        timetable: timetable.filter(d => d.selected).map(day => ({
          ...day,
          location: day.type === 'online' ? null : day.location
        }))
      };

      await axios.post('/api/schedule/create', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const renderLocationFields = (prefix, location, onChange) => (
    <div className="mt-4 space-y-3">
      <div>
        <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Location Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiMapPin size={14} />
          </div>
          <input
            type="text"
            name={`${prefix}.name`}
            value={location.name}
            onChange={onChange}
            placeholder="Company/Office name"
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Address</label>
        <textarea
          name={`${prefix}.address`}
          value={location.address}
          onChange={onChange}
          placeholder="Full address with city and postal code"
          rows={2}
          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Map Link</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <FiLink size={14} />
          </div>
          <input
            type="url"
            name={`${prefix}.mapLink`}
            value={location.mapLink}
            onChange={onChange}
            placeholder="https://maps.google.com/..."
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
      <form onSubmit={saveSchedule} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Schedule Configuration</h2>
              <p className="text-indigo-100 opacity-90">
                {previewed ? 'Review and edit schedule' : 'Set up internship schedule'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-indigo-200 transition-colors p-1 rounded-full"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4 rounded-r">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {!previewed ? (
            <div className="space-y-8">
              {/* Date Range Section */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="mr-2 text-indigo-600" />
                  Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiCalendar />
                      </div>
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleFormChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <FiCalendar />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleFormChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Hours Section */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Work Hours</h3>
                <input
                  type="text"
                  name="workHours"
                  value={form.workHours}
                  onChange={handleFormChange}
                  placeholder="e.g., 9 AM - 5 PM"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Internship Type */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Internship Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {internshipTypes.map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="radio"
                        id={`type-${type}`}
                        name="defaultType"
                        value={type}
                        checked={form.defaultType === type}
                        onChange={handleFormChange}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 -mt-0"
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="ml-2 text-sm font-medium text-gray-700 capitalize"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Online or Hybrid: Default Times & Link */}
                {(form.defaultType === 'online' || form.defaultType === 'hybrid') && (
                  <div className="bg-white mt-6 p-5 rounded-xl border border-gray-300 space-y-6">
                    {/* Default Times */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                        <FiClock className="mr-2 text-indigo-600" />
                        Default Times
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FiClock />
                            </div>
                            <input
                              type="time"
                              name="defaultStartTime"
                              value={form.defaultStartTime}
                              onChange={handleFormChange}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                              <FiClock />
                            </div>
                            <input
                              type="time"
                              name="defaultEndTime"
                              value={form.defaultEndTime}
                              onChange={handleFormChange}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Default Meeting Link */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                        <FiLink className="mr-2 text-indigo-600" />
                        Default Meeting Link
                      </h4>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <FiLink />
                        </div>
                        <input
                          type="url"
                          name="defaultEventLink"
                          value={form.defaultEventLink}
                          onChange={handleFormChange}
                          placeholder="https://meet.example.com/your-link"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Location Fields for hybrid only */}
                    {form.defaultType === 'hybrid' &&
                      renderLocationFields('location', form.defaultLocation, handleFormChange)}
                  </div>
                )}

                {/* Location Fields for offline only */}
                {form.defaultType === 'offline' && (
                  <div className="bg-white mt-6 p-5 rounded-xl border border-gray-300 space-y-6">
                    {renderLocationFields('location', form.defaultLocation, handleFormChange)}
                  </div>
                )}
              </div>

              {/* Weekday Selection + Excel Upload */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Working Days</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
                  {allWeekdays.map(day => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`day-${day}`}
                        checked={form.selectedDays.includes(day)}
                        onChange={() => toggleWeekday(day)}
                        className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 -mt-1"
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className={`ml-2 text-sm font-medium ${form.selectedDays.includes(day) ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {day.substring(0, 3)}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Upload Excel file below the checkboxes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Working Days (.xlsx):
                  </label>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const data = new Uint8Array(evt.target.result);
                          const workbook = XLSX.read(data, { type: 'array' });
                          const sheet = workbook.Sheets[workbook.SheetNames[0]];
                          const rows = XLSX.utils.sheet_to_json(sheet);

                          const formatted = {};
                          rows.forEach((row, index) => {
                            if (row["Date"]) {
                              formatted[`Day - ${index + 1}`] = {
                                summary: row["section summary"] || "",
                                type: (row["Section type"] || "").toLowerCase(),
                                location: row["Section Adress"] || "",
                                link: row["Link"] || ""
                              };
                            }
                          });

                          setExcelData(formatted);
                        };
                        reader.readAsArrayBuffer(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Generate Preview Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generatePreview}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Generate Preview
                  <FiChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Schedule Preview */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Preview</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {timetable.map((day, idx) => (
                    <div
                      key={day.date}
                      className={`p-4 rounded-lg transition-all ${day.selected ? 'bg-white border border-indigo-100 shadow-sm' : 'bg-gray-100 border border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={day.selected}
                            onChange={() => toggleDay(idx)}
                            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${day.type === 'online' ? 'bg-blue-100 text-blue-800' :
                              day.type === 'offline' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                              {day.type}
                            </span>
                          </div>
                        </div>
                        {day.selected && (
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={e => changeField(idx, 'startTime', e.target.value)}
                                className="text-sm rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={e => changeField(idx, 'endTime', e.target.value)}
                                className="text-sm rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                              />
                            </div>
                            <select
                              value={day.type}
                              onChange={e => changeField(idx, 'type', e.target.value)}
                              className="text-sm rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              {internshipTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {day.selected && (
                        <div className="mt-4 ml-14 space-y-4">
                          {(day.type === 'online' || day.type === 'hybrid') && (
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FiLink size={14} />
                              </div>
                              <input
                                type=""
                                value={day.eventLink}
                                onChange={e => changeField(idx, 'eventLink', e.target.value)}
                                placeholder="Meeting link"
                                className="block w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          )}

                          {/* Section Summary Input */}
                          <div>
                            <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Section Summary</label>
                            <textarea
                              value={day.sectionSummary || ""}
                              onChange={e => changeField(idx, 'sectionSummary', e.target.value)}
                              placeholder="Write a brief section summary here..."
                              rows={2}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          {/* Instructor Input */}
                          <div>
                            <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Instructor Name</label>
                            <textarea
                              value={day.instructor || ""}
                              onChange={e => changeField(idx, 'instructor', e.target.value)}
                              placeholder="Enter instructor name(s)..."
                              rows={1}
                              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          {/* Assignment File Upload */}
                          <div className="mt-4">
                            <label className="text-md font-semibold text-gray-700 mb-3 flex items-center">Assignment</label>
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                changeField(idx, 'assignment', file); // store file in state
                              }}
                              className="block w-full text-sm text-gray-700 bg-white border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>

                          {(day.type === 'offline' || day.type === 'hybrid') && (
                            renderLocationFields(`location-${idx}`, day.location, (e) => {
                              const field = e.target.name.split('.')[1];
                              changeLocationField(idx, field, e.target.value);
                            })
                          )}
                        </div>
                      )}

                      {day.events.length > 0 && (
                        <div className="mt-3 ml-14 space-y-2">
                          {day.events.map((ev, i) => (
                            <div key={`${ev.description}-${i}`} className="flex items-start">
                              <span className="flex items-center h-5">
                                <FiCheck className="text-green-500 mr-2" size={14} />
                              </span>
                              <div>
                                <span className="text-sm text-gray-700">{ev.description}</span>
                                <span className={`ml-2 inline-block px-1.5 py-0.5 text-xs rounded-full ${ev.type === 'online' ? 'bg-blue-100 text-blue-800' :
                                  ev.type === 'offline' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                  {ev.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Event Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Add Special Event</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FiCalendar size={16} />
                          </div>
                          <input
                            type="date"
                            name="date"
                            value={manualEvent.date}
                            onChange={handleMEChange}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="description"
                          value={manualEvent.description}
                          onChange={handleMEChange}
                          placeholder="Event description"
                          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                      <select
                        name="type"
                        value={manualEvent.type}
                        onChange={handleMEChange}
                        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {internshipTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {(manualEvent.type === 'offline' || manualEvent.type === 'hybrid') &&
                      renderLocationFields('meLocation', manualEvent.location, handleMEChange)}
                    <button
                      type="button"
                      onClick={addManualEvent}
                      className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <FiPlus size={18} className="mr-2" />
                      Add Event
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Add Additional Day</h4>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FiCalendar size={16} />
                          </div>
                          <input
                            type="date"
                            name="newDate"
                            value={form.newDate}
                            onChange={handleFormChange}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addNewDay}
                      className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <FiPlus size={18} className="mr-2" />
                      Add Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPreviewed(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Settings
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Schedule'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;