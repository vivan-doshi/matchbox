import React from 'react';
import { Link } from 'react-router-dom';
import { XIcon } from 'lucide-react';

interface EmailExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailExistsModal: React.FC<EmailExistsModalProps> = ({ isOpen, onClose, email }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-cardinal"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-3">
          Email Already Registered
        </h2>

        {/* Message */}
        <p className="text-slate-600 text-center mb-2">
          An account with <span className="font-semibold text-slate-800">{email}</span> already exists.
        </p>
        <p className="text-slate-600 text-center mb-6">
          Would you like to log in instead?
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full bg-gradient-to-r from-cardinal to-cardinal-light text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all text-center"
          >
            Go to Login
          </Link>
          <button
            onClick={onClose}
            className="w-full bg-white text-slate-700 py-3 rounded-lg font-medium border-2 border-slate-300 hover:bg-slate-50 transition-all"
          >
            Use Different Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailExistsModal;
