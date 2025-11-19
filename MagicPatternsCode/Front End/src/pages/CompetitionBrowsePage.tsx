import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Search, Filter, Mail, Menu } from 'lucide-react';
import CompetitionCard from '../components/competitions/CompetitionCard';
import Navigation from '../components/Navigation';
import { apiClient } from '../utils/apiClient';
import { Competition } from '../types/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import NotificationBell from '../components/notifications/NotificationBell';

const CompetitionBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCompetitions();
  }, [page, statusFilter, typeFilter, searchQuery]);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCompetitions({
        page,
        limit: 12,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        setCompetitions(response.data);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching competitions:', error);
      alert(error.response?.data?.message || 'Failed to fetch competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCompetitions();
  };

  const handleResendVerificationEmail = async () => {
    if (!user?.email) return;

    try {
      setResendingEmail(true);
      setResendMessage(null);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email: user.email,
      });

      if (response.data.success) {
        setResendMessage({
          type: 'success',
          text: 'Verification email sent! Please check your inbox.',
        });
      }
    } catch (error: any) {
      setResendMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send verification email',
      });
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Hamburger Menu */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-cardinal" />
                <h1 className="text-2xl font-bold text-gray-900">Competitions</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {user?.uscIdVerified && (
                <button
                  onClick={() => navigate('/competitions/create')}
                  className="flex items-center gap-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white px-5 py-2.5 rounded-lg font-semibold hover:from-cardinal-light hover:to-red-700 transition-all shadow-md"
                >
                  <Plus className="h-5 w-5" />
                  Host Competition
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        {!user?.emailVerified && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Verify Your USC Email</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Please verify your USC email address to access competitions. Check your inbox for a verification link, or request a new one below.
                  </p>
                  {resendMessage && (
                    <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
                      resendMessage.type === 'success'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {resendMessage.text}
                    </div>
                  )}
                  <button
                    onClick={handleResendVerificationEmail}
                    disabled={resendingEmail}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="h-4 w-4" />
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USC ID Verification Banner (only shown if email is verified) */}
        {user?.emailVerified && !user?.uscIdVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Verification Processing</h3>
                <p className="text-sm text-yellow-800">
                  Your USC email has been verified! Your account verification is being processed. You'll be able to participate in competitions shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="case-competition">Case Competition</option>
                  <option value="group-project">Group Project</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg font-semibold hover:from-cardinal-light hover:to-red-700 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cardinal"></div>
            <p className="mt-4 text-gray-600">Loading competitions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && competitions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No competitions found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back later for new competitions.</p>
            {user?.uscIdVerified && (
              <button
                onClick={() => navigate('/competitions/create')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg font-semibold hover:from-cardinal-light hover:to-red-700 transition-all"
              >
                <Plus className="h-5 w-5" />
                Host a Competition
              </button>
            )}
          </div>
        )}

        {/* Competitions Grid */}
        {!loading && competitions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {competitions.map((competition) => (
                <CompetitionCard key={competition.id || competition._id} competition={competition} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompetitionBrowsePage;
