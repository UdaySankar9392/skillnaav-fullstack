// Modal.js
import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ isOpen, onClose, title, children, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b z-10">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  isLoading: PropTypes.bool,
};

export default Modal;
