import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, LinkedinIcon, GithubIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const SignupEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const {
    signup
  } = useAuth();
  const navigate = useNavigate();
  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    return trimmedEmail.endsWith('.edu');
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    // Clear error when user starts typing again
    if (error) setError('');
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Only academic email addresses ending with .edu are accepted');
      return;
    }
    try {
      await signup(trimmedEmail);
      navigate('/signup/profile');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Join MATCHBOX</h2>
      <p className="text-slate-600 mb-6">
        Enter your academic email to get started. MATCHBOX is exclusively for
        students and alumni.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Academic Email
          </label>
          <input id="email" type="email" className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`} placeholder="your.name@university.edu" value={email} onChange={handleEmailChange} required />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-xs text-slate-500">
            Only .edu email addresses are accepted
          </p>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
          Continue
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/dashboard" className="text-orange-600 font-medium hover:text-orange-700">
          Log in
        </Link>
      </p>
    </div>;
};
const SignupProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: ''
  });
  const {
    updateUserProfile
  } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    navigate('/signup/links');
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
      <p className="text-slate-600 mb-6">
        Let's start with the basics. This information will be visible to other
        users.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
            First Name
          </label>
          <input id="firstName" name="firstName" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
            Last Name
          </label>
          <input id="lastName" name="lastName" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="mb-6">
          <label htmlFor="preferredName" className="block text-sm font-medium text-slate-700 mb-1">
            Preferred Name (optional)
          </label>
          <input id="preferredName" name="preferredName" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={formData.preferredName} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
          Continue
        </button>
      </form>
    </div>;
};
const SignupLinks: React.FC = () => {
  const [formData, setFormData] = useState({
    linkedin: '',
    github: '',
    medium: ''
  });
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/signup/bio');
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Connect Your Accounts</h2>
      <p className="text-slate-600 mb-6">
        Link your professional accounts to enhance your profile (optional).
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="linkedin" className="block text-sm font-medium text-slate-700 mb-1">
            LinkedIn Profile
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LinkedinIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input id="linkedin" name="linkedin" type="url" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="https://linkedin.com/in/username" value={formData.linkedin} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="github" className="block text-sm font-medium text-slate-700 mb-1">
            GitHub Profile
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <GithubIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input id="github" name="github" type="url" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="https://github.com/username" value={formData.github} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="medium" className="block text-sm font-medium text-slate-700 mb-1">
            Medium or Portfolio
          </label>
          <input id="medium" name="medium" type="url" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="https://medium.com/@username" value={formData.medium} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
          Continue
        </button>
        <button type="button" onClick={() => navigate('/signup/bio')} className="w-full mt-3 bg-white text-slate-700 py-3 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-all">
          Skip for now
        </button>
      </form>
    </div>;
};
const SignupBio: React.FC = () => {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState({
    programming: 0,
    design: 0,
    marketing: 0,
    writing: 0,
    research: 0
  });
  const navigate = useNavigate();
  const handleSkillChange = (skill: string, value: number) => {
    setSkills({
      ...skills,
      [skill]: value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/signup/education');
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Tell Us About Yourself</h2>
      <p className="text-slate-600 mb-6">
        Share a bit about your background and rate your skills.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
            Bio
          </label>
          <textarea id="bio" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" rows={4} placeholder="Tell us about your interests, experience, and what you're looking to work on..." value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Rate Your Skills
          </h3>
          <div className="space-y-4">
            {Object.entries(skills).map(([skill, value]) => <div key={skill}>
                <div className="flex justify-between mb-1">
                  <label htmlFor={skill} className="text-sm font-medium capitalize">
                    {skill}
                  </label>
                  <span className="text-sm text-slate-500">{value}/10</span>
                </div>
                <input id={skill} type="range" min="0" max="10" value={value} onChange={e => handleSkillChange(skill, parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </div>)}
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
          Continue
        </button>
      </form>
    </div>;
};
const SignupEducation: React.FC = () => {
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    graduationYear: '',
    isAlumni: false
  });
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Education Information</h2>
      <p className="text-slate-600 mb-6">
        Tell us about your academic background.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="university" className="block text-sm font-medium text-slate-700 mb-1">
            University/College
          </label>
          <input id="university" name="university" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Stanford University" value={formData.university} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="major" className="block text-sm font-medium text-slate-700 mb-1">
            Major/Field of Study
          </label>
          <input id="major" name="major" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Computer Science" value={formData.major} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="graduationYear" className="block text-sm font-medium text-slate-700 mb-1">
            Expected/Actual Graduation Year
          </label>
          <select id="graduationYear" name="graduationYear" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" value={formData.graduationYear} onChange={handleChange} required>
            <option value="">Select Year</option>
            {Array.from({
            length: 10
          }, (_, i) => new Date().getFullYear() + 5 - i).map(year => <option key={year} value={year}>
                {year}
              </option>)}
            {Array.from({
            length: 10
          }, (_, i) => new Date().getFullYear() - i).map(year => <option key={year} value={year}>
                {year}
              </option>)}
          </select>
        </div>
        <div className="mb-6 flex items-center">
          <input id="isAlumni" name="isAlumni" type="checkbox" className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500" checked={formData.isAlumni} onChange={handleChange} />
          <label htmlFor="isAlumni" className="ml-2 text-sm text-slate-700">
            I am an alumni
          </label>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
          Complete Signup
        </button>
      </form>
    </div>;
};
const SignupFlow: React.FC = () => {
  return <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="flex flex-col justify-center items-center h-full text-white p-12">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-orange-500 font-bold text-xl">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">MATCHBOX</h1>
          <p className="text-xl mb-8 text-center max-w-md">
            Connect with like-minded students and build amazing projects
            together.
          </p>
          <div className="mt-12 space-y-6 w-full max-w-md">
            <div className="bg-white bg-opacity-10 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-orange-500 font-bold">JD</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold">John Doe</h3>
                  <p className="text-sm opacity-80">Computer Science @ MIT</p>
                </div>
              </div>
              <p className="text-sm">
                "MATCHBOX helped me find the perfect team for my senior project.
                We ended up winning the department's innovation award!"
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-orange-500 font-bold">AS</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold">Anna Smith</h3>
                  <p className="text-sm opacity-80">UX Design @ RISD</p>
                </div>
              </div>
              <p className="text-sm">
                "As a designer, I was looking for developers to bring my app
                idea to life. MATCHBOX connected me with the perfect team!"
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center text-slate-600 mb-8 hover:text-orange-500 transition-colors">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to home
          </Link>
          <Routes>
            <Route path="/" element={<SignupEmail />} />
            <Route path="/profile" element={<SignupProfile />} />
            <Route path="/links" element={<SignupLinks />} />
            <Route path="/bio" element={<SignupBio />} />
            <Route path="/education" element={<SignupEducation />} />
          </Routes>
        </div>
      </div>
    </div>;
};
export default SignupFlow;