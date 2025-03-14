import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./../../../../config/Firebase";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

const COUNTRY_API_URL = 'https://restcountries.com/v3.1/all';
const CITY_API_URL = 'https://wft-geo-db.p.rapidapi.com/v1/geo/cities';

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
    internshipType: "FREE", // Default
    compensationDetails: {
      type: "FREE",
      amount: null,
      currency: "USD",
      frequency: "MONTHLY",
    },
    qualifications: [],
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
  const [successMessage, setSuccessMessage] = useState("");


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

  const debouncedSearchCities = useCallback(
    async (query) => {
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
    },
    []
  );

  const handleCityInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, city: value }));
    debouncedSearchCities(value);
  };

  const handleCitySelect = (cityName) => {
    setFormData((prev) => ({ ...prev, city: cityName }));
    setCitySuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "internshipType") {
        return {
          ...prev,
          internshipType: value,
          compensationDetails: { ...prev.compensationDetails, type: value },
        };
      }
      if (name.startsWith("compensationDetails.")) {
        const compensationField = name.split(".")[1];
        return {
          ...prev,
          compensationDetails: {
            ...prev.compensationDetails,
            [compensationField]: value,
          },
        };
      } else if (name.startsWith("contactInfo.")) {
        const contactField = name.split(".")[1];
        return {
          ...prev,
          contactInfo: { ...prev.contactInfo, [contactField]: value },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleQualificationsChange = (e) => {
    const { value } = e.target;
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

    const months =
      end.getMonth() -
      start.getMonth() +
      12 * (end.getFullYear() - start.getFullYear());
    const days = end.getDate() - start.getDate();

    const durationText =
      months > 0
        ? `${months} month${months > 1 ? "s" : ""}${
            days > 0 ? ` and ${days} day${days > 1 ? "s" : ""}` : ""
          }`
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
      internshipType: "FREE",
      compensationDetails: {
        type: "FREE",
        amount: null,
        currency: "USD",
        frequency: "MONTHLY",
      },
      qualifications: [],
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
  
    const partnerId = localStorage.getItem("partnerId");
    if (!partnerId) {
      console.error("No partner ID found in localStorage.");
      return;
    }
  
    const completeFormData = {
      ...formData,
      location: `${formData.city}, ${formData.country}`,
      partnerId: partnerId,
    };
  
    console.log("Complete form data being sent:", completeFormData);
  
    try {
      const response = await axios.post("/api/interns", completeFormData);
      console.log("Internship posted successfully:", response.data);
      saveJob(response.data);
      setSuccessMessage("Internship posted successfully!");
      resetForm();
  
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(
        "Error posting internship:",
        error.response?.data || error.message
      );
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
      const fileRef = ref(storage, `uploads/${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(fileRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // You can add progress monitoring here if needed
        },
        (error) => {
          console.error("Error uploading file:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData((prev) => ({ ...prev, imgUrl: downloadURL }));
          });
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl font-poppins mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Post an Internship
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Job Information */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Title
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Company Name
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Location
          </label>
          <div className="flex space-x-4">
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

            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                placeholder="Start typing city"
                required
              />

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

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Description
          </label>
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

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Start Date
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            End Date
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Calculated Duration
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Qualifications
          </label>
          <input
            type="text"
            name="qualifications"
            value={formData.qualifications.join(", ")}
            onChange={handleQualificationsChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            placeholder="Enter required qualifications, separated by commas"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Contact Information
          </label>
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
              type="tel"
              name="contactInfo.phone"
              value={formData.contactInfo.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
              placeholder="Contact Phone"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
          />
          {uploading && <p>Uploading image...</p>}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 max-h-40 rounded-lg"
            />
          )}
        </div>

        {/* Internship Type and Compensation */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Internship Type
          </label>
          <select
            name="internshipType"
            value={formData.internshipType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
            required
          >
            <option value="FREE">Free</option>
            <option value="STIPEND">Stipend</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {formData.internshipType !== "FREE" && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Amount
              </label>
              <input
                type="number"
                name="compensationDetails.amount"
                value={formData.compensationDetails.amount || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                placeholder="Enter amount"
                required={formData.internshipType !== "FREE"}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Currency
              </label>
              <select
                name="compensationDetails.currency"
                value={formData.compensationDetails.currency}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                required={formData.internshipType !== "FREE"}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Frequency
              </label>
              <select
                name="compensationDetails.frequency"
                value={formData.compensationDetails.frequency}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-teal-500"
                required={formData.internshipType !== "FREE"}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="ONE_TIME">One Time</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-500"
          >
            Post Internship
          </button>
        </div>
        {successMessage && (
  <div className="fixed top-10 right-10 bg-green-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all duration-300">
    {successMessage}
  </div>
)}

      </form>
    </div>
  );
};

export default PostAJob;
