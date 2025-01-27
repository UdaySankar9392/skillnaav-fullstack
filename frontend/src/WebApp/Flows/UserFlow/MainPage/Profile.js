import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    universityName: "",
    dob: "",
    educationLevel: "",
    fieldOfStudy: "",
    desiredField: "",
    linkedin: "",
    portfolio: "",
    financialStatus: "",
    state: "", // Text input for state
    country: "", // Text input for country
    city: "", // Text input for city
    postalCode: "",
    currentGrade: "",
    gradePercentage: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLevel1Open, setIsLevel1Open] = useState(true);
  const [isLevel2Open, setIsLevel2Open] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      // Map user information to state
      setUser((prevUser) => ({
        ...prevUser,
        ...userInfo,
        password: "", // Clear password to ensure it's not shown
        confirmPassword: "", // Clear confirm password to ensure it's not shown
        dob: userInfo.dob ? new Date(userInfo.dob).toISOString().split("T")[0] : "", // Handle dob properly
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setErrorMessage(null);
    setSuccessMessage("");

    if (user.password.length > 0 && user.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (user.password !== user.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      if (!token) {
        setErrorMessage("No token found. Please log in again.");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // Send updated user data to the server
      const { data } = await axios.post("/api/users/profile", user, config);

      if (data) {
        localStorage.setItem("userInfo", JSON.stringify({ ...data, token }));
        setSuccessMessage("Profile updated successfully!");
        setUser((prevUser) => ({
          ...prevUser,
          password: "",
          confirmPassword: "",
        }));
      }
      
    } catch (error) {
      console.error("Update error:", error); // Log complete error for debugging
      setErrorMessage(
        "Failed to update profile. " + (error.response?.data?.message || "Unknown error")
      );
    }
  };

  const level1Fields = [
    { label: "Full name", name: "name", type: "text", placeholder: "Enter your full name" },
    { label: "Email Address", name: "email", type: "email", placeholder: "Enter your email address" },
    { label: "University Name", name: "universityName", type: "text", placeholder: "Enter your university name" },
    { label: "Date of Birth", name: "dob", type: "date" },
    { label: "Education Level", name: "educationLevel", type: "text", placeholder: "Enter your education level" },
    { label: "Field of Study", name: "fieldOfStudy", type: "text", placeholder: "Enter your field of study" },
    { label: "Desired Field", name: "desiredField", type: "text", placeholder: "Enter your desired field" },
    { label: "LinkedIn Profile", name: "linkedin", type: "url", placeholder: "Enter your LinkedIn URL" },
    { label: "Portfolio Link", name: "portfolio", type: "url", placeholder: "Enter your portfolio URL" },
    { label: "Password", name: "password", type: "password", placeholder:"Enter your password" },
    { label:"Confirm Password", name:"confirmPassword", type:"password", placeholder:"Confirm your password"},
  ];

  const level2Fields = [
     { label:"Financial Status", name:"financialStatus", type:"text", placeholder:"Enter your financial status"},
     { label:"Country", name:"country", type:"text", placeholder:"Enter your country"},
     { label:"State", name:"state", type:"text", placeholder:"Enter your state"},
     { label:"City", name:"city", type:"text", placeholder:"Enter your city"},
     { label:"Postal Code", name:"postalCode", type:"text", placeholder:"Enter your postal code"},
     { label:"Current Grade", name:"currentGrade", type:"text", placeholder:"Enter your current grade"},
     { label:"Grade Percentage", name:"gradePercentage", type:"text", placeholder:"Enter your grade percentage"},
   ];

  return (
     <div className="min-h-screen mt-12 bg-white-50 flex items-center justify-center font-poppins">
       <div className="relative w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
         {/* Profile Heading */}
         <div className="text-center md:text-left mb-6">
           <h2 className="text-3xl font-bold text-gray-800">Your Profile</h2>
           <p className="text-gray-500 mt-2">Update your photo and personal details here.</p>
         </div>

         {/* Form Section */}
         <form>
           {/* Level 1 Section */}
           <div>
             <div className="flex items-center justify-between">
               <h3 className="text-2xl font-semibold text-gray-800">Profile Level 1</h3>
               <button
                 type="button"
                 onClick={() => setIsLevel1Open(!isLevel1Open)}
                 className="text-gray-500 focus:outline-none"
               >
                 {isLevel1Open ? '▲' : '▼'}
               </button>
             </div>
             {isLevel1Open && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                 {level1Fields.map(({ label, name, type, placeholder }) => (
                   <div className="flex flex-col" key={name}>
                     <label htmlFor={name} className="text-sm font-medium text-gray-600 mb-2">{label}</label>
                     <input
                       type={type}
                       id={name}
                       name={name}
                       value={user[name]}
                       onChange={handleChange}
                       placeholder={placeholder}
                       className="px-4 py-2 border rounded-md"
                     />
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Level 2 Section */}
           <div>
             <div className="flex items-center justify-between mt-6">
               <h3 className="text-2xl font-semibold text-gray-800">Profile Level 2</h3>
               <button
                 type="button"
                 onClick={() => setIsLevel2Open(!isLevel2Open)}
                 className="text-gray-500 focus:outline-none"
               >
                 {isLevel2Open ? '▲' : '▼'}
               </button>
             </div>
             {isLevel2Open && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                 {level2Fields.map(({ label, name, type, placeholder }) => (
                   <div className="flex flex-col" key={name}>
                     <label htmlFor={name} className="text-gray-700 font-medium mb-2">{label}</label>
                     <input
                       type={type}
                       id={name}
                       name={name}
                       value={user[name]}
                       onChange={handleChange}
                       className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                       placeholder={placeholder}
                     />
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Update Profile Button */}
           <div className="mt-8">
             <button
               type="button"
               onClick={handleUpdateProfile}
               className="w-full bg-blue-600 text-white py-3 rounded-md text-lg"
             >
               {loading ? 'Updating...' : 'Update Profile'}
             </button>
           </div>

           {/* Messages */}
           {errorMessage && <div className="text-red-600 mt-4">{errorMessage}</div>}
           {successMessage && <div className="text-green-600 mt-4">{successMessage}</div>}
         </form>
       </div>
     </div>
   );
};

export default ProfileForm;
