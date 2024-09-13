import React from 'react';

const UnsavedChangesModal = ({ onSave, onDiscard }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center font-poppins">
        <div className="flex flex-col items-center">
          <div className="bg-yellow-100 p-3 rounded-full">
            <svg
              className="h-6 w-6 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 19c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-medium mt-4">Unsaved changes</h2>
          <p className="text-gray-600 mt-2">Do you want to save or discard changes?</p>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
