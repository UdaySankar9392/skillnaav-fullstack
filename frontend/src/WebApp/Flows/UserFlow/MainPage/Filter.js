import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceRange, setExperienceRange] = useState(0);
  const [salaryRange, setSalaryRange] = useState(4);

  if (!isOpen) return null;

  const getExperienceLabel = (value) => {
    if (value === 0) return '6 months';
    if (value < 5) return `${value} yrs`;
    return '5+ yrs';
  };

  const getSalaryLabel = (value) => {
    return `₹${value}L-${value + 10}L`;
  };

  const handleApply = () => {
    const filters = [
      location ? `Location: ${location}` : '',
      skills ? `Skills: ${skills}` : '',
      `Experience: ${getExperienceLabel(experienceRange)}`,
      `Salary: ${getSalaryLabel(salaryRange)}`,
    ].filter(Boolean);
    onApply(filters); // Pass filters to SearchBar
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50" onClick={onClose} />
      <div className="w-full max-w-xs bg-white shadow-lg p-8 rounded-lg relative ml-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {/* Existing filter sections */}
          <div>
            <p className="text-sm font-medium">Sort by</p>
            <div className="flex items-center space-x-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="sort" className="mr-2" /> Most recent
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="sort" className="mr-2" /> Most relevant
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Date posted</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center text-sm">
                <input type="radio" name="date" className="mr-2" /> Past 24 hours
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="date" className="mr-2" /> Past week
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="date" className="mr-2" /> Past month
              </label>
              <label className="flex items-center text-sm">
                <input type="radio" name="date" className="mr-2" /> Any time
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Location</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
              />
              {location && (
                <button
                  onClick={() => setLocation('')}
                  className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Skills</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-sm border rounded-md"
              />
              {skills && (
                <button
                  onClick={() => setSkills('')}
                  className="absolute top-1/2 transform -translate-y-1/2 right-2 text-gray-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Job type</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Full Time
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Contract
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Internship
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Remote</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Remote
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> On-site
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Hybrid
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Salary</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getSalaryLabel(salaryRange)}</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              value={salaryRange}
              onChange={(e) => setSalaryRange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none"
            />
          </div>

          <div>
            <p className="text-sm font-medium">Years of experience</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getExperienceLabel(experienceRange)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={experienceRange}
              onChange={(e) => setExperienceRange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none"
            />
            <label className="flex items-center text-sm mt-2">
              <input type="checkbox" className="mr-2" /> Include jobs with no experience listed
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              setLocation('');
              setSkills('');
              setExperienceRange(0);
              setSalaryRange(4);
              onApply([]); // Clear filters
              onClose();
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
          >
            Reset filters
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-white bg-purple-600 rounded-md"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
