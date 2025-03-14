import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPaperclip, FaPaperPlane, FaSpinner, FaTimes } from "react-icons/fa";

const SkillAnalysis = ({ job, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(job?.jobDescription || "");
  const [requiredSkills, setRequiredSkills] = useState(job?.qualifications?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Debug logs to verify job prop
  useEffect(() => {
    console.log("Job prop received:", job);
    console.log("Job Description:", job?.jobDescription);
    console.log("Required Skills:", job?.qualifications);
  }, [job]);

  useEffect(() => {
    // Initialize messages and state based on whether job details are provided
    if (job) {
      setJobDescription(job.jobDescription || "");
      setRequiredSkills(job.qualifications?.join(", ") || "");
      setMessages([
        { sender: "ai", text: "👋 Welcome! Let's analyze your skills. Please upload your resume (PDF/DOCX)." },
      ]);
      setStep(1); // Start with resume upload for ApplyCards flow
    } else {
      setMessages([
        { sender: "ai", text: "👋 Welcome! Let's analyze your skills. Please upload your resume (PDF/DOCX)." },
      ]);
      setStep(1); // Start with resume upload for manual flow
    }
  }, [job]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
  
    // Clear previous file input
    e.target.value = null;
  
    if (uploadedFile && (uploadedFile.type === "application/pdf" || uploadedFile.name.endsWith(".docx"))) {
      setFile(uploadedFile);
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `📄 Uploaded Resume: ${uploadedFile.name}` },
      ]);
  
      if (job) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "✅ Resume received! Analyzing your skills..." },
        ]);
        analyzeSkills(uploadedFile); // Pass the file directly
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "✅ Resume received! Now, please enter the **job description**." },
        ]);
        setStep(2);
      }
    } else {
      setMessages((prev) => [...prev, { sender: "ai", text: "⚠️ Please upload a valid PDF or DOCX file." }]);
    }
  };

  const handleUserInput = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);

    if (step === 2) {
      setJobDescription(text);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "📌 Great! Now, enter the **required skills for this job**." },
      ]);
      setStep(3); // Move to required skills step
    } else if (step === 3) {
      setRequiredSkills(text);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "🔍 Everything is set! Click 'Analyze Skills' to continue." },
      ]);
      setStep(4); // Move to analyze skills step
    }
  };

  const analyzeSkills = async (uploadedFile = null) => {
    // Use either the passed file or the state file
    const fileToUpload = uploadedFile || file;
    
    if (!fileToUpload) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Please upload your resume before analyzing skills." },
      ]);
      return;
    }

    if (!job && (!jobDescription || !requiredSkills)) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Please complete all steps before analyzing skills." },
      ]);
      return;
    }

    // Prevent duplicate analysis message
    if (!messages.some(msg => msg.text === "⏳ Analyzing your skills...")) {
      setMessages((prev) => [...prev, { sender: "ai", text: "⏳ Analyzing your skills..." }]);
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload); // Only append the file once
      formData.append("job_description", job ? job.jobDescription : jobDescription);
      formData.append("required_skills", job ? job.qualifications.join(", ") : requiredSkills);

      const response = await axios.post("http://localhost:8000/analyze-skills/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { readiness_score, user_skills, skill_gaps, recommendations, quizzes } = response.data;

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `📊 **Readiness Score:**\n\n🟢 **${readiness_score}%**` },
        { sender: "ai", text: `✅ **Extracted Skills:**\n\n${user_skills.length > 0 ? user_skills.map(skill => `• ${skill}`).join("\n") : "❌ **No skills detected.**"}` },
        { sender: "ai", text: `⚠️ **Skill Gaps:**\n\n${skill_gaps.length > 0 ? skill_gaps.map(skill => `🚨 **${skill}**`).join("\n") : "✅ **None**"}` },
        { sender: "ai", text: `📚 **Recommended Courses:**\n\n${recommendations.courses?.join("\n\n") || "❌ No courses available"}` },
        { sender: "ai", text: `📝 **Practice Quiz:**\n\n${
          Array.isArray(quizzes) && quizzes.length > 0
            ? quizzes.map(quiz => `📝 **${quiz.question}**\n` +
                                `${quiz.options.map(option => option).join('\n')}\n` +
                                `**Answer:** ${quiz.answer}`).join("\n\n")
            : "❌ **No quizzes available.**"
        }` },
      ]);
    } catch (error) {
      console.error("Analysis error:", error);
      setMessages((prev) => [...prev, { sender: "ai", text: `❌ Error analyzing skills: ${error.message || "Try again later."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="relative w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header with Close Button */}
        <div className="bg-blue-600 p-6 relative">
          <h2 className="text-2xl font-bold text-white">💬 AI Skill Analysis Chat</h2>
          <p className="text-sm text-blue-200">Upload your resume and analyze your skills for the job.</p>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white text-lg hover:text-gray-300"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
              <div className={`p-4 max-w-md rounded-lg text-sm ${
                msg.sender === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-800"
              }`}>
                {msg.text.split("\n").map((line, idx) => (
                  <p key={idx} className={line.startsWith("**") ? "font-bold" : ""}>
                    {line.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* File Upload */}
        {step === 1 && !loading && (
          <div className="p-6 border-t border-gray-200">
            <button 
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all" 
              onClick={() => fileInputRef.current.click()} 
              disabled={loading}
              aria-label="Upload Resume"
            >
              <FaPaperclip /> Upload Resume
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              accept=".pdf,.docx" 
              disabled={loading}
            />
          </div>
        )}

        {/* Input Fields */}
        {step === 2 && !job && !loading && (
          <div className="p-6 border-t border-gray-200">
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Enter job description..." 
              onKeyDown={(e) => e.key === "Enter" && handleUserInput(e.target.value)}
              aria-label="Enter job description"
              disabled={loading}
            />
          </div>
        )}

        {step === 3 && !job && !loading && (
          <div className="p-6 border-t border-gray-200">
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Enter required skills..." 
              onKeyDown={(e) => e.key === "Enter" && handleUserInput(e.target.value)}
              aria-label="Enter required skills"
              disabled={loading}
            />
          </div>
        )}

        {/* Analyze Button */}
        {step === 4 && !job && (
          <div className="p-6 border-t border-gray-200">
            <button 
              onClick={() => analyzeSkills()} 
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all" 
              disabled={loading} 
              aria-label="Analyze Skills"
            >
              {loading ? <><FaSpinner className="animate-spin" /> Analyzing...</> : <>Analyze Skills <FaPaperPlane /></>}
            </button>
          </div>
        )}

        {/* Loading indicator when API call is in progress */}
        {loading && (
          <div className="p-6 border-t border-gray-200 text-center">
            <FaSpinner className="animate-spin inline-block mr-2" />
            <span>Analyzing your skills. Please wait...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillAnalysis;