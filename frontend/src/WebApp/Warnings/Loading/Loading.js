import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-4 border-t-blue-500 rounded-full animate-spin"></div>

        {/* Loading Text */}
        <p className="mt-4 text-blue-500 text-lg font-semibold">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
