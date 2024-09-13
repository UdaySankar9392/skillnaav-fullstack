import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex items-center justify-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-red-500 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M18.364 5.636a9 9 0 1112.728 0 9 9 0 01-12.728 0zM12 9v3m0 4h.01"
        />
      </svg>
      <span className="font-medium">{message || "An error occurred!"}</span>
    </div>
  );
};

export default ErrorMessage;
