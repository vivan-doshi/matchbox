import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const EmailVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await axios.get(`${API_BASE_URL}/auth/verify-email/${token}`);

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 'Invalid or expired verification link'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="h-16 w-16 text-cardinal mx-auto animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  ✓ Your USC email has been verified
                  <br />
                  ✓ You can now access competitions and all features
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login in 3 seconds...
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg font-semibold hover:from-cardinal-light hover:to-red-700 transition-all"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 mb-2">
                  Possible reasons:
                </p>
                <ul className="text-xs text-red-700 text-left list-disc list-inside">
                  <li>The verification link has expired (48 hours)</li>
                  <li>The link has already been used</li>
                  <li>The link is invalid or corrupted</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg font-semibold hover:from-cardinal-light hover:to-red-700 transition-all"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Sign Up Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MatchBox Logo */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 MatchBox. USC Student Collaboration Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
