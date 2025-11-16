import React, { useState, useEffect, useCallback } from 'react';
import { SearchIcon, FilterIcon, XIcon, UsersIcon, GridIcon, ListIcon, ClockIcon, Loader2Icon } from 'lucide-react';
import UserCard from '../components/discover/UserCard';
import InviteToProjectModal from '../components/discover/InviteToProjectModal';
import UserProfileModal from '../components/discover/UserProfileModal';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import type { User as ApiUser } from '../types/api';
import type { DiscoverUser, DiscoverUserSkill } from '../types/discover';
import { getResumeUrl, getResumeFilename } from '../utils/profileHelpers';

const DiscoverPeoplePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DiscoverUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [inviteUser, setInviteUser] = useState<DiscoverUser | null>(null);
  const [profilePreviewUser, setProfilePreviewUser] = useState<DiscoverUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    school: '',
    major: '',
    skills: [] as string[],
    graduationYear: '',
    minAvailability: 0,
  });

  // Extract unique values for filter options
  const schools = Array.from(new Set(users.map(u => u.school))).sort();
  const majors = Array.from(new Set(users.map(u => u.major))).sort();
  const allSkills = Array.from(new Set(users.flatMap(u => u.skills.map(s => s.name))));
  const graduationYears = Array.from(new Set(users.map(u => u.graduationYear))).sort();

  const transformUser = (user: ApiUser): DiscoverUser => {
    const normalizedId = user.id || (user as any)._id || '';
    const resumeUrl = getResumeUrl(user.resume);
    const resumeFilename = getResumeFilename(user.resume);

    return {
    id: normalizedId,
    rawId: normalizedId,
    _id: (user as any)._id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture:
      ((typeof user.profilePicture === 'string'
        ? user.profilePicture
        : user.profilePicture?.url) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${user.firstName} ${user.lastName}`
      )}&background=f97316&color=fff`) as string,
    title: user.major ? `${user.major} Student` : 'Student',
    school: user.university || 'Unknown School',
    major: user.major || 'Undeclared',
    graduationYear: user.graduationYear ? String(user.graduationYear) : 'N/A',
    skills:
      user.skills && user.skills.length > 0
        ? (user.skills as DiscoverUserSkill[])
        : [
            {
              name: 'Collaboration',
              proficiency: 'Fluent',
            },
          ],
    interests: user.interests && user.interests.length > 0 ? user.interests : ['Collaboration'],
    availability: {
      totalHours: user.weeklyAvailability?.hoursPerWeek ?? 0,
    },
    bio: user.bio || 'This user has not added a bio yet.',
    linkedin: user.professionalLinks?.linkedin,
    github: user.professionalLinks?.github,
    resume: resumeUrl && resumeFilename ? {
      url: resumeUrl,
      filename: resumeFilename,
    } : undefined,
  };
};

  const fetchUsers = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.searchUsers(query ? { q: query } : undefined);
      if (response.success && response.data) {
        const mappedUsers = response.data
          .map(transformUser)
          .filter(u => u.id && u.id !== authUser?.id)
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      const message = err.response?.data?.message || err.message || 'Failed to load people.';
      setError(message);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(searchQuery.trim() || undefined);
    }, 400);
    return () => clearTimeout(handler);
  }, [fetchUsers, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const applyFilters = () => {
    let filtered = [...users];

    // School filter
    if (filters.school) {
      filtered = filtered.filter(user => user.school === filters.school);
    }

    // Major filter
    if (filters.major) {
      filtered = filtered.filter(user => user.major === filters.major);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(user =>
        filters.skills.some(filterSkill =>
          user.skills.some(userSkill => userSkill.name === filterSkill)
        )
      );
    }

    // Graduation year filter
    if (filters.graduationYear) {
      filtered = filtered.filter(user => user.graduationYear === filters.graduationYear);
    }

    // Availability filter
    if (filters.minAvailability > 0) {
      filtered = filtered.filter(user => user.availability.totalHours >= filters.minAvailability);
    }

    setFilteredUsers(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      school: '',
      major: '',
      skills: [],
      graduationYear: '',
      minAvailability: 0,
    });
    setSearchQuery('');
  };

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const hasActiveFilters =
    filters.school ||
    filters.major ||
    filters.skills.length > 0 ||
    filters.graduationYear ||
    filters.minAvailability > 0 ||
    searchQuery;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Discover People
        </h1>
        <p className="text-slate-600">
          Find USC students and alumni to collaborate with
        </p>
      </div>

      {error && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => fetchUsers(searchQuery.trim() || undefined)}
            className="rounded-lg bg-white px-3 py-1 text-red-600 shadow-sm hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, major, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <XIcon className="h-4 w-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-orange-50 text-orange-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* School Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                School/College
              </label>
              <select
                value={filters.school}
                onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Schools</option>
                {schools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            {/* Major Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Major
              </label>
              <select
                value={filters.major}
                onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Majors</option>
                {majors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>

            {/* Graduation Year Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Graduation Year
              </label>
              <select
                value={filters.graduationYear}
                onChange={(e) => setFilters({ ...filters, graduationYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                <option value="">All Years</option>
                {graduationYears.map(year => (
                  <option key={year} value={year}>Class of {year}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Availability (hrs/week)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={filters.minAvailability}
                onChange={(e) => setFilters({ ...filters, minAvailability: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {/* Skills Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {allSkills.slice(0, 12).map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.skills.includes(skill)
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={handleClearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-700">
          Showing <span className="font-semibold">{filteredUsers.length}</span>{' '}
          {filteredUsers.length === 1 ? 'person' : 'people'}
        </p>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GridIcon className="h-4 w-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {/* User Grid/List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Loader2Icon className="h-10 w-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-600">Loading people across the platform...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <UsersIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No people found</h3>
          <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              viewMode={viewMode}
              onInvite={() => setInviteUser(user)}
              onViewProfile={() => setProfilePreviewUser(user)}
            />
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {inviteUser && (
        <InviteToProjectModal
          user={inviteUser}
          onClose={() => setInviteUser(null)}
        />
      )}

      {profilePreviewUser && (
        <UserProfileModal
          user={profilePreviewUser}
          onClose={() => setProfilePreviewUser(null)}
          onInvite={() => {
            setProfilePreviewUser(null);
            setInviteUser(profilePreviewUser);
          }}
        />
      )}
    </div>
  );
};

export default DiscoverPeoplePage;
