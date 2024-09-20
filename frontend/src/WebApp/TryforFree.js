import React from "react";
import { useNavigate } from "react-router-dom";
import skillnaavlogo from "../assets/skillnaav_logo-250w.png";
const TryforFree = () => {
  const navigate = useNavigate();

  const handleOptionClick = (path) => {
    // Navigate to the specified path
    window.open(path, "_blank");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
      }}
    >
      <img
        src={skillnaavlogo}
        style={{ width: "210px", height: "auto" }}
        alt="SkillNaav Logo"
      />

      <h1
        style={{
          marginBottom: "20px",
          fontWeight: "700",
          color: "#004d40",
          fontSize: "2.5rem",
        }}
      >
        Try for Free
      </h1>
      <h2
        style={{
          marginBottom: "30px",
          color: "#00796b",
          fontSize: "1.25rem",
        }}
      >
        Choose how you'd like to continue:
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxWidth: "450px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <button
          style={{
            backgroundColor: "#7F56D9", // User (Student) button color
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          onClick={() => handleOptionClick("/user")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Continue as User (Student)
        </button>
        <button
          style={{
            backgroundColor: "#009688", // Teal color for Partner button
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          onClick={() => handleOptionClick("/partner")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Continue as Partner
        </button>
        <button
          style={{
            backgroundColor: "#81d4fa", // Light blue color for Admin button
            color: "#fff",
            border: "none",
            padding: "15px 25px",
            fontWeight: "600",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            outline: "none",
          }}
          onClick={() => handleOptionClick("/admin/login")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Continue as Admin
        </button>
      </div>
    </div>
  );
};

export default TryforFree;
