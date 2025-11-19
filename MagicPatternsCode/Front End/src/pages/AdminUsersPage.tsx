import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, RefreshCwIcon, UserIcon } from 'lucide-react';
import apiClient from '../utils/apiClient';
import type { User } from '../types/api';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.request({
        method: 'GET',
        url: '/users/all'
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-slate-600 hover:text-cardinal transition-colors mr-4">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">User Database</h1>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-full font-medium hover:bg-slate-50 transition-all"
          >
            <RefreshCwIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-cardinal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium mb-2">Error</p>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-2">Database Overview</h2>
              <p className="text-lg">Total Users: <span className="font-bold">{users.length}</span></p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">User</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Email</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">University</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Major</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Year</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Skills</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Joined</th>
                      <th className="text-center px-6 py-3 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => {
                      const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;
                      const totalSkills = user.skills ? Object.keys(user.skills).length : 0;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f97316&color=fff&size=100`}
                                alt={displayName}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                              <div>
                                <p className="font-medium text-slate-900">{displayName}</p>
                                {user.preferredName && (
                                  <p className="text-xs text-slate-500">{user.firstName} {user.lastName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.university}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.major}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.graduationYear || '-'}
                            {user.isAlumni && <span className="ml-1 text-xs text-cardinal">(Alumni)</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {totalSkills > 0 ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {totalSkills} skills
                              </span>
                            ) : (
                              <span className="text-slate-400">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              to={`/profile`}
                              className="inline-flex items-center text-sm text-cardinal hover:text-cardinal-light font-medium"
                            >
                              <UserIcon className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p className="mb-2">No users found</p>
                  <p className="text-sm">Sign up to create your first user</p>
                </div>
              )}
            </div>

            {/* User Details Cards (Mobile-friendly) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
              {users.map((user) => {
                const displayName = user.preferredName || `${user.firstName} ${user.lastName}`;

                return (
                  <div key={user.id} className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center mb-3">
                      <img
                        src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f97316&color=fff&size=100`}
                        alt={displayName}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-slate-500">University:</span> {user.university}</p>
                      <p><span className="text-slate-500">Major:</span> {user.major}</p>
                      {user.graduationYear && <p><span className="text-slate-500">Year:</span> {user.graduationYear}</p>}
                      <p><span className="text-slate-500">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminUsersPage;
