import React from "react";

const PageNotFound = () => {
  return (
    <div className="flex flex-col items-center font-poppins justify-center h-screen text-center bg-gray-100 text-gray-800 px-4">
      <h1 className="text-9xl font-bold text-blue-500">404</h1>
      <p className="text-3xl font-semibold text-gray-700 mt-4">
        Oops! Page Not Found
      </p>
      <p className="text-lg text-gray-500 mt-2 max-w-lg">
        The page you're looking for doesn't exist or has been moved.
      </p>
    </div>
  );
};

export default PageNotFound;
