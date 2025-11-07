import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, LinkedinIcon, GithubIcon, CameraIcon, UploadIcon, XIcon, FileTextIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSignupContext } from '../context/SignupContext';
import apiClient from '../utils/apiClient';
import AvailabilityCalendar, { TimeSlot } from '../components/shared/AvailabilityCalendar';

const SignupEmail: React.FC = () => {
  const { formData, updateFormData } = useSignupContext();
  const [email, setEmail] = useState(formData.email || '');
  const [password, setPassword] = useState(formData.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    return trimmedEmail.endsWith('.edu');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (error) setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Only academic email addresses ending with .edu are accepted');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Check if email already exists
      setChecking(true);
      const response = await apiClient.checkEmail(trimmedEmail);
      setChecking(false);

      if (response.data?.exists) {
        setError('This email is already in use. Please use a different email or log in.');
        return;
      }

      // Save email and password to context
      updateFormData({ email: trimmedEmail, password });
      // Proceed to next step
      navigate('/signup/profile');
    } catch (err: any) {
      setChecking(false);
      console.error('Email check error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Join MATCHBOX</h2>
      <p className="text-slate-600 mb-6">
        Enter your academic email to get started. MATCHBOX is exclusively for
        USC students and alumni.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Academic Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
            placeholder="your.name@university.edu"
            value={email}
            onChange={handleEmailChange}
            required
          />
          <p className="mt-2 text-xs text-slate-500">
            Only .edu email addresses are accepted
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
            placeholder="Enter a secure password"
            value={password}
            onChange={handlePasswordChange}
            required
            minLength={6}
          />
          <p className="mt-2 text-xs text-slate-500">
            At least 6 characters
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'} outline-none transition-all`}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={checking}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? 'Checking email...' : 'Continue'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-600 font-medium hover:text-orange-700">
          Log in
        </Link>
      </p>
    </div>;
};
const SignupProfile: React.FC = () => {
  const { updateFormData } = useSignupContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredName: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload an image file (JPG, PNG, WEBP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setProfilePicture(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setUploadError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data to SignupContext
    updateFormData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      preferredName: formData.preferredName,
      profilePicture: profilePicture || undefined
    });
    navigate('/signup/links');
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
      <p className="text-slate-600 mb-6">
        Let's start with the basics. This information will be visible to other
        users.
      </p>
      <form onSubmit={handleSubmit}>
        {/* Profile Picture Upload */}
        <div className="mb-6 flex flex-col items-center">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Profile Picture (optional)
          </label>

          <div className="relative">
            {profilePicturePreview ? (
              <div className="relative">
                <img
                  src={profilePicturePreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
                />
                <button
                  type="button"
                  onClick={removeProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  aria-label="Remove picture"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-50 transition-all">
                  <CameraIcon className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 text-center px-2">
                    Add Photo
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
          <p className="mt-2 text-xs text-slate-500 text-center">
            JPG, PNG or WEBP (max 5MB)
          </p>
        </div>

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
  const { formData: signupFormData, updateFormData } = useSignupContext();
  const [formData, setFormData] = useState({
    linkedin: signupFormData.linkedin || '',
    github: signupFormData.github || '',
    portfolio: signupFormData.portfolio || ''
  });
  const [resume, setResume] = useState<File | null>(signupFormData.resume || null);
  const [resumeError, setResumeError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setResumeError('');

    if (file) {
      // Validate file type (PDF or DOCX)
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setResumeError('Please upload a PDF or DOCX file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('File size must be less than 5MB');
        return;
      }

      setResume(file);
    }
  };

  const removeResume = () => {
    setResume(null);
    setResumeError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save links and resume to context
    updateFormData({
      linkedin: formData.linkedin,
      github: formData.github,
      portfolio: formData.portfolio,
      resume
    });
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
        <div className="mb-4">
          <label htmlFor="portfolio" className="block text-sm font-medium text-slate-700 mb-1">
            Portfolio Website
          </label>
          <input id="portfolio" name="portfolio" type="url" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="https://yourportfolio.com" value={formData.portfolio} onChange={handleChange} />
        </div>

        {/* Resume Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Resume (optional)
          </label>

          {resume ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center">
                <FileTextIcon className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{resume.name}</p>
                  <p className="text-xs text-slate-500">{(resume.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeResume}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
                <UploadIcon className="h-6 w-6 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Upload Resume</p>
                  <p className="text-xs text-slate-500">PDF or DOCX (max 5MB)</p>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeChange}
                className="hidden"
              />
            </label>
          )}

          {resumeError && (
            <p className="mt-2 text-sm text-red-600">{resumeError}</p>
          )}
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
// Available interests organized by category
const AVAILABLE_INTERESTS = {
  'Tech & Development': ['Web Development', 'Mobile Apps', 'AI & Machine Learning', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'IoT', 'AR/VR'],
  'Design & Creative': ['UI/UX Design', 'Graphic Design', 'Product Design', 'Animation', 'Photography', 'Video Production', '3D Modeling', 'Illustration'],
  'Business & Entrepreneurship': ['Startups', 'Product Management', 'Marketing', 'Sales', 'Business Strategy', 'Consulting', 'Finance', 'E-commerce'],
  'Data & Analytics': ['Data Science', 'Data Visualization', 'Business Intelligence', 'Analytics', 'Research', 'Statistics'],
  'Community & Events': ['Hackathons', 'Networking Events', 'Mentorship', 'Community Building', 'Public Speaking', 'Workshops'],
  'Content & Media': ['Content Creation', 'Blogging', 'Podcasting', 'Social Media', 'Copywriting', 'Journalism', 'Technical Writing'],
  'Other': ['Open Source', 'Gaming', 'Education', 'Sustainability', 'Healthcare Tech', 'Music Tech', 'Sports Tech']
};

// Available skills organized by category
const AVAILABLE_SKILLS = {
  'Programming': ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin'],
  'Web Development': ['React', 'Vue.js', 'Angular', 'Node.js', 'HTML/CSS', 'Next.js', 'Express', 'Django', 'Flask'],
  'Data & AI': ['Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis', 'Deep Learning', 'NLP'],
  'Design': ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Graphic Design', 'Prototyping', 'User Research'],
  'Mobile': ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Mobile UI/UX'],
  'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Linux', 'DevOps'],
  'Other': ['Project Management', 'Marketing', 'Content Writing', 'Research', 'Product Management', 'Business Strategy']
};

interface UserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Fluent' | 'Expert';
}

const SignupBio: React.FC = () => {
  const { formData, updateFormData } = useSignupContext();
  const [bio, setBio] = useState(formData.bio || '');
  const [interests, setInterests] = useState<string[]>(formData.interests || []);
  const [phase, setPhase] = useState<'selecting' | 'proficiency'>('selecting');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState(formData.weeklyAvailability?.hoursPerWeek || 10);
  const navigate = useNavigate();

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Toggle skill selection
  const toggleSkillSelection = (skillName: string) => {
    setSelectedSkillNames(prev =>
      prev.includes(skillName)
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  // Proceed to proficiency assignment
  const proceedToProficiency = () => {
    const skillsWithDefaults: UserSkill[] = selectedSkillNames.map(name => ({
      name,
      proficiency: 'Intermediate' // Smart default
    }));
    setUserSkills(skillsWithDefaults);
    setPhase('proficiency');
  };

  // Go back to selection
  const goBackToSelection = () => {
    setPhase('selecting');
  };

  // Update skill proficiency
  const updateSkillProficiency = (skillName: string, proficiency: UserSkill['proficiency']) => {
    setUserSkills(prev =>
      prev.map(skill =>
        skill.name === skillName ? { ...skill, proficiency } : skill
      )
    );
  };

  // Set all skills to same proficiency
  const setAllProficiency = (proficiency: UserSkill['proficiency']) => {
    setUserSkills(prev =>
      prev.map(skill => ({ ...skill, proficiency }))
    );
  };

  // Remove a skill
  const removeSkill = (skillName: string) => {
    setUserSkills(prev => prev.filter(skill => skill.name !== skillName));
    setSelectedSkillNames(prev => prev.filter(name => name !== skillName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert skills from {name, proficiency} array to backend format {programming: number, design: number, ...}
    // Map proficiency levels to numbers
    const proficiencyToNumber = {
      'Beginner': 3,
      'Intermediate': 5,
      'Fluent': 7,
      'Expert': 10
    };

    // Initialize skills object with all categories at 0
    const skillsObject: {
      programming: number;
      design: number;
      marketing: number;
      writing: number;
      research: number;
    } = {
      programming: 0,
      design: 0,
      marketing: 0,
      writing: 0,
      research: 0
    };

    // Map each user skill to a category and take the highest proficiency in each category
    userSkills.forEach(skill => {
      const proficiencyValue = proficiencyToNumber[skill.proficiency];
      const skillLower = skill.name.toLowerCase();

      // Programming skills
      if (skillLower.includes('javascript') || skillLower.includes('python') || skillLower.includes('java') ||
          skillLower.includes('c++') || skillLower.includes('typescript') || skillLower.includes('programming') ||
          skillLower.includes('go') || skillLower.includes('rust') || skillLower.includes('php') || skillLower.includes('swift') ||
          skillLower.includes('kotlin') || skillLower.includes('react') || skillLower.includes('vue') || skillLower.includes('angular') ||
          skillLower.includes('node') || skillLower.includes('html') || skillLower.includes('css') || skillLower.includes('next') ||
          skillLower.includes('express') || skillLower.includes('django') || skillLower.includes('flask') || skillLower.includes('sql') ||
          skillLower.includes('docker') || skillLower.includes('kubernetes') || skillLower.includes('aws') || skillLower.includes('azure') ||
          skillLower.includes('gcp') || skillLower.includes('devops') || skillLower.includes('mobile') || skillLower.includes('ios') ||
          skillLower.includes('android') || skillLower.includes('flutter') || skillLower.includes('react native')) {
        skillsObject.programming = Math.max(skillsObject.programming, proficiencyValue);
      }

      // Design skills
      if (skillLower.includes('design') || skillLower.includes('figma') || skillLower.includes('adobe') ||
          skillLower.includes('sketch') || skillLower.includes('ux') || skillLower.includes('ui') ||
          skillLower.includes('prototype') || skillLower.includes('graphic')) {
        skillsObject.design = Math.max(skillsObject.design, proficiencyValue);
      }

      // Marketing skills
      if (skillLower.includes('marketing') || skillLower.includes('business') || skillLower.includes('strategy') ||
          skillLower.includes('management')) {
        skillsObject.marketing = Math.max(skillsObject.marketing, proficiencyValue);
      }

      // Writing skills
      if (skillLower.includes('writing') || skillLower.includes('content') || skillLower.includes('copywriting')) {
        skillsObject.writing = Math.max(skillsObject.writing, proficiencyValue);
      }

      // Research skills
      if (skillLower.includes('research') || skillLower.includes('data') || skillLower.includes('analysis') ||
          skillLower.includes('machine learning') || skillLower.includes('tensorflow') || skillLower.includes('pytorch')) {
        skillsObject.research = Math.max(skillsObject.research, proficiencyValue);
      }
    });

    // Save all data to context
    updateFormData({
      bio,
      interests,
      skills: skillsObject,
      weeklyAvailability: {
        hoursPerWeek
      }
    });

    navigate('/signup/education');
  };

  return <div className="max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Tell Us About Yourself</h2>
      <p className="text-slate-600 mb-6">
        Share a bit about your background and select your skills.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
            Bio
          </label>
          <textarea id="bio" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" rows={4} placeholder="Tell us about your interests, experience, and what you're looking to work on..." value={bio} onChange={e => setBio(e.target.value)} />
        </div>

        {/* Interests Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Your Interests
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Select the areas you're interested in working on or learning about.
          </p>

          {/* Selected Interests Display */}
          {interests.length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span key={interest} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2">
                    {interest}
                    <button
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="text-orange-700 hover:text-orange-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {interests.length} interest{interests.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}

          {/* Interests by Category - Scrollable */}
          <div className="max-h-[300px] overflow-y-auto pr-2 border border-slate-200 rounded-lg p-4" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}>
            {Object.entries(AVAILABLE_INTERESTS).map(([category, categoryInterests]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categoryInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        interests.includes(interest)
                          ? 'bg-orange-500 text-white border-2 border-orange-500'
                          : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {interest}
                      {interests.includes(interest) && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Your Skills
          </h3>

          {phase === 'selecting' && (
            <div className="skills-selection-phase">
              <p className="text-sm text-slate-500 mb-4">
                Choose all skills that apply. You'll set proficiency levels next.
              </p>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 mb-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />

              {/* Skills by Category - Fixed Height with Scroll */}
              <div className="max-h-[400px] overflow-y-auto pr-2 mb-4 border border-slate-200 rounded-lg p-4" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}>
                {Object.entries(AVAILABLE_SKILLS).map(([category, skills]) => {
                  const filteredSkills = skills.filter(skill =>
                    skill.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredSkills.length === 0) return null;

                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {filteredSkills.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkillSelection(skill)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              selectedSkillNames.includes(skill)
                                ? 'bg-orange-500 text-white border-2 border-orange-500'
                                : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            {skill}
                            {selectedSkillNames.includes(skill) && (
                              <span className="ml-1">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selection Footer */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-slate-700">
                  {selectedSkillNames.length} skill{selectedSkillNames.length !== 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={proceedToProficiency}
                  disabled={selectedSkillNames.length === 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedSkillNames.length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  }`}
                >
                  Set Proficiency Levels →
                </button>
              </div>
            </div>
          )}

          {phase === 'proficiency' && (
            <div className="proficiency-assignment-phase">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goBackToSelection}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center"
                >
                  ← Back to Skills
                </button>
                <p className="text-sm text-slate-500">
                  {userSkills.length} skill{userSkills.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg flex-wrap">
                <span className="text-sm font-medium text-slate-600">Quick assign:</span>
                <button
                  type="button"
                  onClick={() => setAllProficiency('Beginner')}
                  className="px-3 py-1 text-xs rounded-md bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  All Beginner
                </button>
                <button
                  type="button"
                  onClick={() => setAllProficiency('Intermediate')}
                  className="px-3 py-1 text-xs rounded-md bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  All Intermediate
                </button>
                <button
                  type="button"
                  onClick={() => setAllProficiency('Fluent')}
                  className="px-3 py-1 text-xs rounded-md bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  All Fluent
                </button>
                <button
                  type="button"
                  onClick={() => setAllProficiency('Expert')}
                  className="px-3 py-1 text-xs rounded-md bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  All Expert
                </button>
              </div>

              {/* Skills List with Proficiency - Fixed Height with Scroll */}
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}>
                {userSkills.map((skill, index) => (
                  <div key={skill.name} className="p-3 border border-slate-200 rounded-lg hover:shadow-sm transition-all bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-slate-800">{skill.name}</span>
                        <span className="ml-2 text-xs text-slate-400">
                          {index + 1}/{userSkills.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.name)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Proficiency Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {(['Beginner', 'Intermediate', 'Fluent', 'Expert'] as const).map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updateSkillProficiency(skill.name, level)}
                          className={`py-2 px-2 text-xs rounded-md font-medium transition-all ${
                            skill.proficiency === level
                              ? 'bg-orange-500 text-white border-2 border-orange-500'
                              : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Weekly Availability Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Weekly Availability
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            How many hours per week can you dedicate to projects?
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                min="0"
                max="168"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                placeholder="e.g., 10"
              />
            </div>
            <span className="text-sm text-slate-600 font-medium">hours/week</span>
          </div>

          {/* Quick selection buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              type="button"
              onClick={() => setHoursPerWeek(5)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                hoursPerWeek === 5
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              5 hrs
            </button>
            <button
              type="button"
              onClick={() => setHoursPerWeek(10)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                hoursPerWeek === 10
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              10 hrs
            </button>
            <button
              type="button"
              onClick={() => setHoursPerWeek(15)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                hoursPerWeek === 15
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              15 hrs
            </button>
            <button
              type="button"
              onClick={() => setHoursPerWeek(20)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all ${
                hoursPerWeek === 20
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              20 hrs
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={phase === 'selecting' && selectedSkillNames.length === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </form>
    </div>;
};
// USC Schools and their majors
const USC_SCHOOLS_MAJORS: Record<string, string[]> = {
  "USC Dornsife College of Letters, Arts and Sciences": [
    "African American Studies", "American Studies & Ethnicity", "Anthropology", "Art History",
    "Biochemistry", "Biological Sciences", "Chemistry", "Classics", "Comparative Literature",
    "Earth Sciences", "East Asian Languages and Cultures", "Economics", "English", "Environmental Studies",
    "French & Francophone Studies", "Gender & Sexuality Studies", "Geodesign", "Gerontology",
    "Health & Humanity", "History", "Human Biology", "International Relations", "Italian Studies",
    "Jewish Studies", "Linguistics", "Mathematics", "Middle East Studies", "Narrative Studies",
    "Neuroscience", "Philosophy", "Physics", "Political Science", "Psychology", "Public Policy",
    "Quantitative Biology", "Religion", "Science, Technology & Society", "Slavic Languages & Literatures",
    "Sociology", "Spanish & Portuguese", "Statistics"
  ],
  "USC Marshall School of Business": [
    "Business Administration", "Accounting", "Finance", "Marketing", "Business Analytics",
    "Entrepreneurship", "Global Business", "Real Estate Finance", "Supply Chain Management"
  ],
  "USC Viterbi School of Engineering": [
    "Aerospace Engineering", "Astronautical Engineering", "Biomedical Engineering", "Chemical Engineering",
    "Civil Engineering", "Computer Engineering & Computer Science", "Computer Science", "Computer Science & Business Administration",
    "Computer Science & Economics", "Computer Science (Games)", "Data Science", "Electrical Engineering",
    "Environmental Engineering", "Industrial & Systems Engineering", "Mechanical Engineering", "Petroleum Engineering"
  ],
  "USC School of Cinematic Arts": [
    "Animation & Digital Arts", "Business of Cinematic Arts", "Cinema & Media Studies",
    "Film & Television Production", "Interactive Entertainment", "Media Arts & Practice",
    "Peter Stark Producing Program", "Writing for Screen & Television"
  ],
  "USC Annenberg School for Communication and Journalism": [
    "Communication", "Communication Data Science", "Journalism", "Public Relations"
  ],
  "USC Roski School of Art and Design": [
    "Art", "Design", "Fine Arts"
  ],
  "USC Thornton School of Music": [
    "Arts Leadership", "Composition", "Jazz Studies", "Music Industry", "Music Production",
    "Performance", "Popular Music", "Screen Scoring"
  ],
  "USC School of Architecture": [
    "Architecture", "Architectural Studies", "Landscape Architecture"
  ],
  "USC Price School of Public Policy": [
    "Public Policy", "Policy, Planning, & Development", "Real Estate Development"
  ],
  "USC Suzanne Dworak-Peck School of Social Work": [
    "Human Development & Aging", "Social Work"
  ],
  "USC Bovard College": [
    "Interdisciplinary Studies"
  ],
  "USC Kaufman School of Dance": [
    "Dance"
  ],
  "USC School of Dramatic Arts": [
    "Theatre", "Acting", "Design", "Stage Management", "Technical Direction"
  ],
  "Other": ["Other"]
};

const SignupEducation: React.FC = () => {
  const { formData: signupFormData } = useSignupContext();
  const { signup } = useAuth();
  const [school, setSchool] = useState('');
  const [major, setMajor] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [isAlumni, setIsAlumni] = useState(false);
  const [availableMajors, setAvailableMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Update available majors when school changes
  React.useEffect(() => {
    if (school) {
      setAvailableMajors(USC_SCHOOLS_MAJORS[school] || []);
      setMajor(''); // Reset major when school changes
      setCustomMajor(''); // Reset custom major
    } else {
      setAvailableMajors([]);
    }
  }, [school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!school) {
      setError('Please select your school/college');
      return;
    }
    if (!major) {
      setError('Please select your major');
      return;
    }
    if (major === 'Other' && !customMajor.trim()) {
      setError('Please specify your major');
      return;
    }
    if (!graduationYear) {
      setError('Please select your graduation year');
      return;
    }

    // Check if we have email and password from earlier steps
    if (!signupFormData.email || !signupFormData.password) {
      setError('Missing email or password. Please start over.');
      navigate('/signup');
      return;
    }

    try {
      setLoading(true);

      // Prepare signup data with all collected information
      const signupData = {
        email: signupFormData.email,
        password: signupFormData.password,
        firstName: signupFormData.firstName || '',
        lastName: signupFormData.lastName || '',
        preferredName: signupFormData.preferredName,
        university: school,
        major: major === 'Other' ? customMajor : major,
        graduationYear: parseInt(graduationYear),
        isAlumni,
        bio: signupFormData.bio,
        skills: signupFormData.skills,
        interests: signupFormData.interests,
        weeklyAvailability: signupFormData.weeklyAvailability,
        professionalLinks: {
          linkedin: signupFormData.linkedin,
          github: signupFormData.github,
          portfolio: signupFormData.portfolio,
        },
      };

      // Call the signup API
      await signup(signupData);

      // Success! Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };
  return <div>
      <h2 className="text-2xl font-bold mb-6">Education Information</h2>
      <p className="text-slate-600 mb-6">
        Tell us about your academic background at USC.
      </p>
      <form onSubmit={handleSubmit}>
        {/* School/College Dropdown */}
        <div className="mb-4">
          <label htmlFor="school" className="block text-sm font-medium text-slate-700 mb-1">
            USC School/College <span className="text-red-500">*</span>
          </label>
          <select
            id="school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            required
          >
            <option value="">Select your school/college...</option>
            {Object.keys(USC_SCHOOLS_MAJORS).map(schoolName => (
              <option key={schoolName} value={schoolName}>{schoolName}</option>
            ))}
          </select>
        </div>

        {/* Major Dropdown - Dependent on School */}
        <div className="mb-4">
          <label htmlFor="major" className="block text-sm font-medium text-slate-700 mb-1">
            Major/Field of Study <span className="text-red-500">*</span>
          </label>
          <select
            id="major"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            disabled={!school}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">
              {school ? "Select your major..." : "Select a school first"}
            </option>
            {availableMajors.map(majorName => (
              <option key={majorName} value={majorName}>{majorName}</option>
            ))}
          </select>
        </div>

        {/* Custom Major Input - Only if "Other" selected */}
        {major === 'Other' && (
          <div className="mb-4">
            <label htmlFor="customMajor" className="block text-sm font-medium text-slate-700 mb-1">
              Please specify your major <span className="text-red-500">*</span>
            </label>
            <input
              id="customMajor"
              type="text"
              value={customMajor}
              onChange={(e) => setCustomMajor(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              placeholder="Enter your major"
              required
            />
          </div>
        )}

        {/* Graduation Year */}
        <div className="mb-4">
          <label htmlFor="graduationYear" className="block text-sm font-medium text-slate-700 mb-1">
            Expected/Actual Graduation Year <span className="text-red-500">*</span>
          </label>
          <select
            id="graduationYear"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            required
          >
            <option value="">Select Year</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={`past-${year}`} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Alumni Checkbox */}
        <div className="mb-6 flex items-center">
          <input
            id="isAlumni"
            type="checkbox"
            checked={isAlumni}
            onChange={(e) => setIsAlumni(e.target.checked)}
            className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="isAlumni" className="ml-2 text-sm text-slate-700">
            I am an alumni
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Creating Account...' : 'Complete Signup'}
        </button>
      </form>
    </div>;
};
const BackButton: React.FC = () => {
  const location = window.location.pathname;
  const navigate = useNavigate();

  const getBackPath = () => {
    if (location === '/signup' || location === '/signup/') {
      return '/';
    } else if (location === '/signup/profile') {
      return '/signup';
    } else if (location === '/signup/links') {
      return '/signup/profile';
    } else if (location === '/signup/bio') {
      return '/signup/links';
    } else if (location === '/signup/education') {
      return '/signup/bio';
    }
    return '/';
  };

  const handleBack = () => {
    navigate(getBackPath());
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center text-slate-600 mb-8 hover:text-orange-500 transition-colors"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-2" />
      Back
    </button>
  );
};

const SignupFlow: React.FC = () => {
  return <div className="min-h-screen auth-page-background flex">
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
            Connect with other Trojans for your next team project
          </p>
          <div className="mt-12 space-y-6 w-full max-w-md">
            <div className="bg-white bg-opacity-10 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-orange-500 font-bold">JD</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold">John Doe</h3>
                  <p className="text-sm opacity-80">Business Administration, '24</p>
                </div>
              </div>
              <p className="text-sm">
                "Matchbox helped me find the perfect team for a recent consulting case competition. We ended up winning 1st place!"
              </p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-orange-500 font-bold">AS</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold">Anna Smith</h3>
                  <p className="text-sm opacity-80">MBA Student</p>
                </div>
              </div>
              <p className="text-sm">
                "As an MBA student, I was looking for Data Analytics students to bring my passion project to life. Matchbox made it super easy."
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <BackButton />
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