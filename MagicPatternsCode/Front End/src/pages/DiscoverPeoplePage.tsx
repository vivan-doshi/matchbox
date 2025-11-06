import React, { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, XIcon, UsersIcon, GridIcon, ListIcon, ClockIcon } from 'lucide-react';
import UserCard from '../components/discover/UserCard';
import InviteToProjectModal from '../components/discover/InviteToProjectModal';

// Mock user data - this would come from an API in production
const MOCK_USERS = [
  {
    id: '1',
    firstName: 'Emma',
    lastName: 'Wilson',
    profilePicture: 'https://i.pravatar.cc/300?img=1',
    title: 'Computer Science Student',
    school: 'USC Viterbi School of Engineering',
    major: 'Computer Science',
    graduationYear: '2025',
    skills: [
      { name: 'React', proficiency: 'Expert' as const },
      { name: 'Node.js', proficiency: 'Fluent' as const },
      { name: 'Python', proficiency: 'Fluent' as const },
      { name: 'Machine Learning', proficiency: 'Intermediate' as const },
    ],
    interests: ['Web Development', 'AI/ML', 'Hackathons'],
    availability: { totalHours: 15 },
    bio: 'Passionate about building innovative web applications and exploring AI. Looking to collaborate on projects that make a difference.',
    linkedin: 'https://linkedin.com/in/emmawilson',
    github: 'https://github.com/emmawilson',
  },
  {
    id: '2',
    firstName: 'Marcus',
    lastName: 'Johnson',
    profilePicture: 'https://i.pravatar.cc/300?img=2',
    title: 'Business Administration Student',
    school: 'USC Marshall School of Business',
    major: 'Business Administration',
    graduationYear: '2024',
    skills: [
      { name: 'Product Management', proficiency: 'Expert' as const },
      { name: 'Market Research', proficiency: 'Fluent' as const },
      { name: 'Financial Analysis', proficiency: 'Fluent' as const },
      { name: 'UI/UX Design', proficiency: 'Intermediate' as const },
    ],
    interests: ['Entrepreneurship', 'Product Strategy', 'Startups'],
    availability: { totalHours: 10 },
    bio: 'Aspiring product manager with experience in market research and user experience design. Love turning ideas into reality.',
    linkedin: 'https://linkedin.com/in/marcusjohnson',
  },
  {
    id: '3',
    firstName: 'Sophia',
    lastName: 'Lee',
    profilePicture: 'https://i.pravatar.cc/300?img=3',
    title: 'Graphic Design Student',
    school: 'USC Roski School of Art and Design',
    major: 'Graphic Design',
    graduationYear: '2025',
    skills: [
      { name: 'UI/UX Design', proficiency: 'Expert' as const },
      { name: 'Figma', proficiency: 'Expert' as const },
      { name: 'Adobe Creative Suite', proficiency: 'Expert' as const },
      { name: 'Prototyping', proficiency: 'Fluent' as const },
    ],
    interests: ['UI/UX', 'Branding', 'Mobile Design'],
    availability: { totalHours: 12 },
    bio: 'UI/UX designer focused on creating beautiful and intuitive user experiences. Always excited to work on creative projects.',
    linkedin: 'https://linkedin.com/in/sophialee',
    github: 'https://github.com/sophialee',
  },
  {
    id: '4',
    firstName: 'Daniel',
    lastName: 'Brown',
    profilePicture: 'https://i.pravatar.cc/300?img=4',
    title: 'Data Science Student',
    school: 'USC Viterbi School of Engineering',
    major: 'Data Science',
    graduationYear: '2026',
    skills: [
      { name: 'Python', proficiency: 'Expert' as const },
      { name: 'Machine Learning', proficiency: 'Fluent' as const },
      { name: 'Data Visualization', proficiency: 'Fluent' as const },
      { name: 'SQL', proficiency: 'Fluent' as const },
    ],
    interests: ['Data Analytics', 'Machine Learning', 'Cloud Computing'],
    availability: { totalHours: 20 },
    bio: 'Data science enthusiast with a passion for extracting insights from data. Looking to apply ML to real-world problems.',
    linkedin: 'https://linkedin.com/in/danielbrown',
    github: 'https://github.com/danielbrown',
  },
  {
    id: '5',
    firstName: 'Olivia',
    lastName: 'Martinez',
    profilePicture: 'https://i.pravatar.cc/300?img=5',
    title: 'Mobile Development Student',
    school: 'USC Viterbi School of Engineering',
    major: 'Computer Science',
    graduationYear: '2024',
    skills: [
      { name: 'React Native', proficiency: 'Expert' as const },
      { name: 'Swift', proficiency: 'Fluent' as const },
      { name: 'Kotlin', proficiency: 'Intermediate' as const },
      { name: 'Firebase', proficiency: 'Fluent' as const },
    ],
    interests: ['Mobile Apps', 'iOS Development', 'Cross-platform'],
    availability: { totalHours: 8 },
    bio: 'Mobile developer specializing in iOS and cross-platform apps. Love creating smooth and engaging mobile experiences.',
    linkedin: 'https://linkedin.com/in/oliviamartinez',
    github: 'https://github.com/oliviamartinez',
  },
  {
    id: '6',
    firstName: 'Noah',
    lastName: 'Garcia',
    profilePicture: 'https://i.pravatar.cc/300?img=6',
    title: 'Communications Student',
    school: 'USC Annenberg School for Communication',
    major: 'Communications',
    graduationYear: '2025',
    skills: [
      { name: 'Content Writing', proficiency: 'Expert' as const },
      { name: 'Social Media', proficiency: 'Expert' as const },
      { name: 'Public Relations', proficiency: 'Fluent' as const },
      { name: 'Marketing', proficiency: 'Fluent' as const },
    ],
    interests: ['Content Strategy', 'Digital Marketing', 'Brand Building'],
    availability: { totalHours: 14 },
    bio: 'Communications specialist with a knack for storytelling and brand strategy. Passionate about creating compelling narratives.',
    linkedin: 'https://linkedin.com/in/noahgarcia',
  },
];

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  title: string;
  school: string;
  major: string;
  graduationYear: string;
  skills: UserSkill[];
  interests: string[];
  availability: {
    totalHours: number;
  };
  bio: string;
  linkedin?: string;
  github?: string;
}

interface UserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
}

const DiscoverPeoplePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [inviteUser, setInviteUser] = useState<User | null>(null);

  const [filters, setFilters] = useState({
    school: '',
    major: '',
    skills: [] as string[],
    graduationYear: '',
    minAvailability: 0,
  });

  // Extract unique values for filter options
  const schools = Array.from(new Set(users.map(u => u.school)));
  const majors = Array.from(new Set(users.map(u => u.major)));
  const allSkills = Array.from(new Set(users.flatMap(u => u.skills.map(s => s.name))));
  const graduationYears = Array.from(new Set(users.map(u => u.graduationYear))).sort();

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters]);

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          user.major.toLowerCase().includes(query) ||
          user.school.toLowerCase().includes(query) ||
          user.skills.some(s => s.name.toLowerCase().includes(query)) ||
          user.interests.some(i => i.toLowerCase().includes(query))
        );
      });
    }

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
      {filteredUsers.length === 0 ? (
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
    </div>
  );
};

export default DiscoverPeoplePage;
