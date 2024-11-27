import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfilePicture = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("userProfileData");
    const googleData = localStorage.getItem("userFormData");
  
    if (googleData && savedData) {
      // Merge googleData and savedData
      return {
        ...JSON.parse(savedData),
        ...JSON.parse(googleData), // googleData will overwrite savedData in case of conflicts
      };
    }
  
    if (googleData) {
      return JSON.parse(googleData);
    }
  
    if (savedData) {
      return JSON.parse(savedData);
    }
  
    // Fallback to initialData
    const initialData = {
      fieldOfStudy: location.state?.formData?.fieldOfStudy || "",
      desiredField: "",
      linkedin: "",
      portfolio: "",
      name: location.state?.googleUser?.name || "",
      email: location.state?.googleUser?.email || "",
    };
  
    return initialData;
  });
  

  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("userProfileData", JSON.stringify(formData));
  }, [formData]);

  // Clean up the preview URL when the component unmounts or when picture is removed
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    } else {
      setProfilePicture(null);
      setPreviewUrl(null);
    }
  };

  const isFormValid = () => {
    const linkedinUrlPattern = /^https:\/\/(www\.)?linkedin\.com\/.+$/;
    const portfolioUrlPattern =
      /^(https?:\/\/)?([\w\d\.-]+)\.([a-z\.]{2,6})(\/[\w\d\.-]*)*\/?$/;

    return (
      formData.desiredField &&
      formData.linkedin &&
      linkedinUrlPattern.test(formData.linkedin) &&
      (!formData.portfolio || portfolioUrlPattern.test(formData.portfolio))
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Show loading state

    // Merge the profile data including Google sign-up data

    const completeProfileData = {
      ...formData,
      profilePicture, // Send as file (multipart)
    };
    console.log("completeProfileData",completeProfileData);
    let googleSignUp = completeProfileData.googleSignUp == true ? true : false;
    console.log("google======", completeProfileData.googleSignUp);
    if (!googleSignUp) {
      if (
        !completeProfileData.name ||
        !completeProfileData.email ||
        !completeProfileData.universityName ||
        !completeProfileData.dob ||
        !completeProfileData.educationLevel ||
        !completeProfileData.fieldOfStudy ||
        !completeProfileData.desiredField ||
        !completeProfileData.linkedin
      ) {
        alert("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(completeProfileData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
        let url = googleSignUp ? "/google-login" : "/api/users/register"
      const response = await axios.post(`${url}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        localStorage.removeItem("userProfileData");
        navigate("/user-main-page");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        `Registration failed: ${
          error.response?.data?.message || "An unknown error occurred."
        }`
      );
    } finally {
      setIsSubmitting(false); // Hide loading state
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 font-poppins">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <div className="space-y-4">
          <h2 className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300 text-lg font-bold text-gray-700">
            PROFESSIONAL INFORMATION
          </h2>
          <div>
            <label
              htmlFor="desiredField"
              className="block text-sm font-medium text-gray-700"
            >
              Desired field of Internship/Job
            </label>
            <select
              name="desiredField"
              value={formData.desiredField}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select Your Field</option>
              <option value="space">Space Internships</option>
              <option value="aero">Aeronautical Internships</option>
              <option value="tech">Tech Internships</option>
              <option value="research">Research Internships</option>
              <option value="education">Education Internships</option>
            </select>
          </div>

          <h2 className="w-full h-12 p-3 bg-purple-100 border-b border-purple-300 text-lg font-bold text-gray-700">
            UPLOAD PROFILE PICTURE
          </h2>
          <div>
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium text-gray-700"
            >
              LinkedIn Profile
            </label>
            <input
              id="linkedin"
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your LinkedIn profile"
            />
          </div>
          <div>
            <label
              htmlFor="portfolio"
              className="block text-sm font-medium text-gray-700"
            >
              Portfolio Website (Optional)
            </label>
            <input
              id="portfolio"
              type="text"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your Portfolio URL"
            />
          </div>
          {/* <div>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="rounded-full border w-24 h-24"
              />
            ) : (
              <div>No picture selected</div>
            )}
            <input
              type="file"
              onChange={handleImageChange}
              className="mt-2 block w-full"
              accept="image/*"
            />
          </div> */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-2 px-4 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-2 px-4 rounded-md ${
                isSubmitting || !isFormValid()
                  ? "bg-purple-300 text-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePicture;
