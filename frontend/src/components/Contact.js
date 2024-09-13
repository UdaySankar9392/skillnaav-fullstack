import React, { useState } from "react";
import axios from "axios"; // Import axios for HTTP requests

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/contact", {
        name,
        email,
        subject,
        message,
      });
      console.log("Form submitted successfully!");
      console.log("Submitted data:", response.data); // Log the response data
      setSubmitted(true); // Set submitted to true to trigger animation
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const SuccessAnimation = () => (
    <div
      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
      role="alert"
    >
      <strong className="font-bold">Success!</strong>
      <span className="block sm:inline"> Your message has been submitted.</span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          className="fill-current h-6 w-6 text-green-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 5.652a.5.5 0 0 0-.707 0L10 9.293 6.36 5.652a.5.5 0 1 0-.708.708L9.293 10l-3.64 3.64a.5.5 0 1 0 .708.708L10 10.707l3.64 3.64a.5.5 0 1 0 .708-.708L10.707 10l3.64-3.64a.5.5 0 0 0 0-.708z" />
        </svg>
      </span>
    </div>
  );

  return (
    <div
      id="contacts"
      className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg overflow-hidden shadow-lg"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 py-10 px-8 lg:p-12 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex flex-col justify-center items-center">
          <h1 className="text-white text-4xl lg:text-5xl font-bold mb-6 text-center">
            Have Questions? Get in Touch
          </h1>
          <p className="text-white text-lg mb-6 text-center">
            <a
              href="mailto:info@navigatebi.com"
              className="text-white font-medium"
            >
              Email to: info@skillnaav.com
            </a>
          </p>
        </div>

        {/* Right Section */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-1/2 py-10 px-8 lg:p-12 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500"
        >
          <h2 className="text-white text-3xl lg:text-4xl font-bold mb-8 text-center">
            Contact Us
          </h2>
          {submitted && <SuccessAnimation />}
          <input
            type="text"
            placeholder="Enter Your Name*"
            className="w-full py-3 px-4 bg-white rounded-md text-lg text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter Your Email*"
            className="w-full py-3 px-4 bg-white rounded-md text-lg text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Your Question About.."
            className="w-full py-3 px-4 bg-white rounded-md text-lg text-gray-800 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            placeholder="Your Message..."
            className="w-full py-3 px-4 bg-white rounded-md text-lg text-gray-800 mb-6 h-32 focus:outline-none focus:ring-2 focus:ring-pink-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            className="py-4 px-8 bg-white rounded-md text-pink-500 text-lg font-medium hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
