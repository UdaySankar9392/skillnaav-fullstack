import React, { useState } from "react";
import axios from "axios";

const PostAJob = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("Internship");
  const [jobDescription, setJobDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateOrDuration, setEndDateOrDuration] = useState("");
  const [stipendOrSalary, setStipendOrSalary] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [preferredExperience, setPreferredExperience] = useState("None");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [applicationProcess, setApplicationProcess] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [applicationLinkOrEmail, setApplicationLinkOrEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      jobTitle,
      companyName,
      location,
      jobType,
      jobDescription,
      startDate,
      endDateOrDuration,
      stipendOrSalary,
      qualifications: qualifications.split(",").map((q) => q.trim()), // Convert string to array
      preferredExperience,
      applicationDeadline,
      applicationProcess,
      contactInfo,
      applicationLinkOrEmail,
    };

    try {
      const response = await axios.post("/api/interns", postData);

      console.log("Internship posted successfully:", response.data);
      resetForm();
    } catch (error) {
      if (error.response) {
        console.error("Error posting internship:", error.response.data);
      } else {
        console.error("Network error:", error.message);
      }
    }
  };

  const resetForm = () => {
    setJobTitle("");
    setCompanyName("");
    setLocation("");
    setJobType("Internship");
    setJobDescription("");
    setStartDate("");
    setEndDateOrDuration("");
    setStipendOrSalary("");
    setQualifications("");
    setPreferredExperience("None");
    setApplicationDeadline("");
    setApplicationProcess("");
    setContactInfo({
      name: "",
      email: "",
      phone: "",
    });
    setApplicationLinkOrEmail("");
  };

  return (
    <div className="max-w-4xl font-poppins mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Post an Internship
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
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
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter company name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter job location"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Type
          </label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          >
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter job description"
            rows="5"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            End Date / Duration
          </label>
          <input
            type="text"
            value={endDateOrDuration}
            onChange={(e) => setEndDateOrDuration(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter end date or duration"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Stipend / Salary
          </label>
          <input
            type="text"
            value={stipendOrSalary}
            onChange={(e) => setStipendOrSalary(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter stipend or salary"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Qualifications
          </label>
          <input
            type="text"
            value={qualifications}
            onChange={(e) => setQualifications(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter qualifications, separated by commas"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Preferred Experience
          </label>
          <select
            value={preferredExperience}
            onChange={(e) => setPreferredExperience(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
          >
            <option value="None">None</option>
            <option value="Internship">Internship</option>
            <option value="1 year">1 year</option>
            <option value="2 years">2 years</option>
            <option value="3 years">3 years</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Deadline
          </label>
          <input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Process
          </label>
          <textarea
            value={applicationProcess}
            onChange={(e) => setApplicationProcess(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Describe the application process"
            rows="3"
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Contact Information
          </label>
          <input
            type="text"
            value={contactInfo.name}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, name: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Your Name"
            required
          />
          <input
            type="email"
            value={contactInfo.email}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, email: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500 mt-2"
            placeholder="Your Email"
            required
          />
          <input
            type="tel"
            value={contactInfo.phone}
            onChange={(e) =>
              setContactInfo({ ...contactInfo, phone: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500 mt-2"
            placeholder="Your Phone Number"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Application Link / Email
          </label>
          <input
            type="text"
            value={applicationLinkOrEmail}
            onChange={(e) => setApplicationLinkOrEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
            placeholder="Enter application link or email"
            required
          />
        </div>

        <button
          type="submit"
          // onClick={}
          className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition duration-200"
        >
          Post Internship
        </button>
      </form>
    </div>
  );
};

export default PostAJob;
