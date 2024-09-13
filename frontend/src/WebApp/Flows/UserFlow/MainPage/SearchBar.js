import React, { useState } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import FilterModal from './Filter'; // Updated path
import Card from './Card';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState([]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
  };

  const applyFilters = (filters) => {
    setAppliedFilters(filters);
    setIsFilterOpen(false);
  };

  const removeFilter = (filterIndex) => {
    setAppliedFilters(appliedFilters.filter((_, index) => index !== filterIndex));
  };

  return (
    <div className="relative font-poppins">
      <div className="w-full mb-4">
        <div className="flex items-center bg-white shadow rounded-lg overflow-hidden w-full">
          <div className="flex items-center px-4 border-r border-gray-300">
            <FaSearch className="w-5 h-5 text-gray-600" />
          </div>
          <input
            type="text"
            placeholder="Search for internships and jobs"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-3 text-gray-700 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="px-4 text-gray-600">
              <FaTimes className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleFilterClick}
            className="flex items-center justify-center px-4 border-l border-gray-300"
          >
            <FaFilter className="w-6 h-6 text-gray-600" />
            <span className="ml-2 text-gray-600">Filter</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center space-x-2 mb-4">
        {appliedFilters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
          >
            <span className="mr-2">{filter}</span>
            <button onClick={() => removeFilter(index)} className="text-gray-600">
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <div className="w-full">
        <Card searchTerm={searchTerm} />
      </div>

      {isFilterOpen && (
        <FilterModal
          isOpen={isFilterOpen}
          onClose={closeFilterModal}
          onApply={applyFilters} // Pass applyFilters to the modal
        />
      )}
    </div>
  );
};

export default SearchBar;
