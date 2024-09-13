import React from 'react';

const Support = () => {
  return (
    <div className="min-h-screen flex items-start justify-start bg-white-50 font-poppins">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg  m-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Write to us!</h2>
        <p className="text-gray-500 mb-6">We will get back to you at the earliest.</p>
        
        <form>
          <div className="mb-6 flex items-center">
            <label htmlFor="fullName" className="w-1/4 text-gray-700 font-medium">Full name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Name"
              className="w-3/4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="mb-6 flex items-center">
            <label htmlFor="email" className="w-1/4 text-gray-700 font-medium">Email address</label>
            <div className="relative w-3/4">
              <input
                type="email"
                id="email"
                placeholder="E-mail"
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016.528 3H3.472a2 2 0 00-1.469 2.884zM18 8.118l-8 4-8-4V13a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <label htmlFor="description" className="w-1/4 text-gray-700 font-medium">Describe your issue</label>
            <textarea
              id="description"
              placeholder="Enter a description..."
              className="w-3/4 h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            ></textarea>
          </div>

          <div className="mb-6 flex items-start">
            <label htmlFor="image" className="w-1/4 text-gray-700 font-medium">Add an image</label>
            <div className="w-3/4">
              <p className="text-gray-500 text-sm mb-2">Attach any images that help in understanding your problem better</p>
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center h-full cursor-pointer text-purple-600 hover:text-purple-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.928V13a4 4 0 014-4h8a4 4 0 014 4v3.928a2 2 0 01-1.052 1.754l-6.633 3.317a4 4 0 01-3.63 0l-6.633-3.317A2 2 0 014 16.928z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v.01M12 6v6M12 18h0" />
                  </svg>
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-sm text-gray-500">or drag and drop</span>
                  <span className="text-sm text-gray-400 mt-1">PNG, JPG (max. 800x400px)</span>
                  <input type="file" id="image" className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white font-semibold py-2 rounded-md hover:bg-purple-600 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Support;
