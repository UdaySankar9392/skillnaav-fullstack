import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

// API Keys and URL for API Calls (for example purposes)
const COUNTRY_API_URL = 'https://restcountries.com/v3.1/all';  // Fetch all countries
const CITY_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';  // GeoDB Cities API for cities

const PostAJob = () => {
  const { saveJob } = useTabContext();

  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    city: "",
    country: "",
    jobType: "Internship",
    jobDescription: "",
    startDate: "",
    endDateOrDuration: "",
    duration: "",
    stipendOrSalary: "",
    currency: "USD",
    time: "",
    qualifications: "",
    contactInfo: {
      name: "",
      email: "",
      phone: "",
    },
    imgUrl: "",
    studentApplied: false,
    adminApproved: false,
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Fetch all countries when the component mounts
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(COUNTRY_API_URL);
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Debounced search for country suggestions
  const debouncedSearchCountries = useCallback(
    async (query) => {
      if (!query) {
        setCountrySuggestions([]);
        return;
      }

      const filteredCountries = countries.filter((country) =>
        country.name.common.toLowerCase().includes(query.toLowerCase())
      );
      setCountrySuggestions(filteredCountries);
    },
    [countries]
  );

  const handleCountryInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, country: value }));
    debouncedSearchCountries(value);

    setCitySuggestions([]);
  };

 // Debounced search for city suggestions based on user input
 const debouncedSearchCities = useCallback(async (query) => {
  if (!query) {
    setCitySuggestions([]);
    return;
  }
  try {
    const response = await axios.get(CITY_API_URL, {
      headers: {
        "X-RapidAPI-Key": "7025bea304msh17f75625e027c56p185594jsncd48a2c69153",
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      params: {
        namePrefix: query,
        limit: 10,
        minPopulation: 100000,
      },
    });
    setCitySuggestions(response.data.data);
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
}, []);

const handleCityInputChange = (e) => {
  const { value } = e.target;
  setFormData((prev) => ({ ...prev, city: value }));
  debouncedSearchCities(value);
};

const handleCitySelect = (cityName) => {
  setFormData((prev) => ({ ...prev, city: cityName }));
  setCitySuggestions([]);
};

// const handleCountryInputChange = (e) => {
//   const { value } = e.target;
//   setFormData((prev) => ({ ...prev, country: value }));
// };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("contactInfo.")) {
      const contactField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [contactField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQualificationsChange = (e) => {
    const { value } = e.target;
    // Split the input by commas and trim extra spaces
    setFormData((prev) => ({
      ...prev,
      qualifications: value.split(",").map((q) => q.trim()),
    }));
  };

  const calculateDuration = useCallback(() => {
    const { startDate, endDateOrDuration } = formData;

    if (!startDate || !endDateOrDuration) {
      setFormData((prev) => ({ ...prev, duration: "" }));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDateOrDuration);

    if (end <= start) {
      setFormData((prev) => ({ ...prev, duration: "Invalid duration" }));
      return;
    }

    const months = end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());
    const days = end.getDate() - start.getDate();

    const durationText = months > 0
      ? `${months} month${months > 1 ? "s" : ""}${days > 0 ? ` and ${days} day${days > 1 ? "s" : ""}` : ""}`
      : `${days} day${days > 1 ? "s" : ""}`;

    setFormData((prev) => ({ ...prev, duration: durationText }));
  }, [formData.startDate, formData.endDateOrDuration]);

  useEffect(() => {
    calculateDuration();
  }, [formData.startDate, formData.endDateOrDuration, calculateDuration]);


  const resetForm = () => {
    setFormData({
      jobTitle: "",
      companyName: "",
      city: "",
      country: "",
      jobType: "Internship",
      jobDescription: "",
      startDate: "",
      endDateOrDuration: "",
      duration: "",
      stipendOrSalary: "",
      currency: "USD",
      time: "",
      qualifications: "",
      contactInfo: {
        name: "",
        email: "",
        phone: "",
      },
      imgUrl: "",
      studentApplied: false,
      adminApproved: false,
    });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const completeFormData = {
      ...formData,
      location: `${formData.city}, ${formData.country}`,
      salaryDetails: `${formData.stipendOrSalary} ${formData.currency} (${formData.time})`,
      jobDuration: formData.duration || "N/A",
    };

    try {
      const response = await axios.post("/api/interns", completeFormData);
      console.log("Internship posted successfully:", response.data);
      saveJob(response.data);
      resetForm();
    } catch (error) {
      console.error("Error posting internship:", error.response?.data || error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selectedFile);

    try {
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(selectedFile.name);
      const snapshot = await fileRef.put(selectedFile);
      const downloadURL = await snapshot.ref.getDownloadURL();
      setFormData((prev) => ({ ...prev, imgUrl: downloadURL }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl font-poppins mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Post an Internship</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Other form fields... */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter job title"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter company name"
            required
          />
        </div>
        <div>
  <label className="block text-gray-700 font-medium mb-2">Location</label>
  <div className="flex space-x-4">
    {/* Country Autocomplete */}
    <input
      type="text"
      name="country"
      value={formData.country}
      onChange={handleCountryInputChange}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
      placeholder="Start typing country name"
      list="country-suggestions"
      required
    />
    <datalist id="country-suggestions">
      {countrySuggestions.map((country) => (
        <option key={country.cca3} value={country.name.common}>
          {country.name.common}
        </option>
      ))}
    </datalist>

    {/* City Autocomplete */}
    <div className="relative">
  {/* City Input Field */}
  <input
    type="text"
    name="city"
    value={formData.city}
    onChange={handleCityInputChange}
    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
    placeholder="Start typing city"
    required
  />

  {/* City Suggestions Dropdown */}
  {citySuggestions.length > 0 && (
    <ul className="absolute z-10 w-full max-h-48 mt-2 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
      {citySuggestions.map((city) => (
        <li
          key={city.id}
          className="px-4 py-2 cursor-pointer hover:bg-teal-50 hover:text-teal-700"
          onClick={() => handleCitySelect(city.name)}
        >
          {city.name}
        </li>
      ))}
    </ul>
  )}
</div>
  </div>
</div>

        {/* Other form fields... */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Job Description</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Describe the job responsibilities, requirements, etc."
            rows="4"
            required
          ></textarea>
        </div>

        {/* Salary (Stipend), Currency, and Time Dropdowns */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Stipend/Salary</label>
          <input
            type="text"
            name="stipendOrSalary"
            value={formData.stipendOrSalary}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter stipend or salary"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="INR">INR</option>
            <option value="GBP">GBP</option>
            {/* Add more options as needed */}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Time (Hourly/Monthly)</label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          >
            <option value="Per Hour">Per Hour</option>
            <option value="Per Day">Per Day</option>
            <option value="Per Month">Per Month</option>
            <option value="Per week">Per Week</option>
          </select>
        </div>


        <div>
          <label className="block text-gray-700 font-medium mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">End Date</label>
          <input
            type="date"
            name="endDateOrDuration"
            value={formData.endDateOrDuration}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Calculated Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Duration will be calculated"
            readOnly
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Qualifications</label>
          <input
            type="text"
            name="qualifications"
            value={formData.qualifications}
            onChange={handleQualificationsChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter required qualifications, separated by commas"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Contact Information</label>
          <div className="space-y-2">
            <input
              type="text"
              name="contactInfo.name"
              value={formData.contactInfo.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
              placeholder="Contact Name"
              required
            />
            <input
              type="email"
              name="contactInfo.email"
              value={formData.contactInfo.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
              placeholder="Contact Email"
              required
            />
            <input
              type="text"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
              placeholder="Contact Phone"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Job Image</label>
          <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
          {uploading && <p className="text-teal-700">Uploading image...</p>}
          {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 h-32 object-cover rounded-lg shadow-lg" />}
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default PostAJob;