import React, { useState } from 'react';
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  InfoIcon,
  CheckCircleIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

interface TeamMember {
  name: string;
  profileLink: string;
  role: string;
  description: string;
}

interface Role {
  title: string;
  description: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  timeCommitment: string;
  duration: number;
  roles: Role[];
  creatorRole: {
    title: string;
    responsibilities: string;
    expertise: string;
  };
  existingMembers: TeamMember[];
}

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
  // Helper function to convert text to title case (capitalize first letter of each word)
  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    timeCommitment: '',
    duration: 8, // Default to 8 weeks
    roles: [{ title: '', description: '' }],
    creatorRole: {
      title: '',
      responsibilities: '',
      expertise: '',
    },
    existingMembers: [],
  });

  // UI state
  const [showExistingMembers, setShowExistingMembers] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDurationTooltip, setShowDurationTooltip] = useState(false);

  // Calculate form completion percentage
  const calculateProgress = (): number => {
    const requiredFields = [
      formData.title,
      formData.description,
      formData.category,
      formData.timeCommitment,
      formData.roles.filter((r) => r.title.trim()).length > 0,
      formData.creatorRole.title,
    ];

    const completed = requiredFields.filter(Boolean).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  // Validation logic
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'title':
        return value.trim().length < 3 ? 'Title must be at least 3 characters' : '';
      case 'description':
        return value.trim().length < 20
          ? 'Description must be at least 20 characters'
          : '';
      case 'category':
        return !value ? 'Please select a category' : '';
      case 'timeCommitment':
        return !value ? 'Please select time commitment' : '';
      case 'roles':
        return value.filter((r: Role) => r.title.trim()).length === 0
          ? 'At least one team role is required'
          : '';
      case 'creatorRole':
        return !value.title ? 'Please define your role in the project' : '';
      default:
        return '';
    }
  };

  // Handle field blur for validation
  const handleBlur = (fieldName: string) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true });
    const error = validateField(fieldName, formData[fieldName as keyof FormData]);
    setErrors({ ...errors, [fieldName]: error });
  };

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Role handlers
  const handleRoleChange = (index: number, field: string, value: string) => {
    const newRoles = [...formData.roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setFormData({ ...formData, roles: newRoles });
  };

  const addRole = () => {
    setFormData({ ...formData, roles: [...formData.roles, { title: '', description: '' }] });
  };

  const removeRole = (index: number) => {
    const newRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({ ...formData, roles: newRoles.length > 0 ? newRoles : [{ title: '', description: '' }] });
  };

  // Creator role handlers
  const handleCreatorRoleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      creatorRole: { ...formData.creatorRole, [field]: value },
    });
  };

  // Existing members handlers
  const addExistingMember = () => {
    setFormData({
      ...formData,
      existingMembers: [
        ...formData.existingMembers,
        { name: '', profileLink: '', role: '', description: '' },
      ],
    });
    setShowExistingMembers(true);
  };

  const removeExistingMember = (index: number) => {
    const newMembers = formData.existingMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, existingMembers: newMembers });
    if (newMembers.length === 0) {
      setShowExistingMembers(false);
    }
  };

  const handleExistingMemberChange = (index: number, field: string, value: string) => {
    const newMembers = [...formData.existingMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, existingMembers: newMembers });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    newErrors.title = validateField('title', formData.title);
    newErrors.description = validateField('description', formData.description);
    newErrors.category = validateField('category', formData.category);
    newErrors.timeCommitment = validateField('timeCommitment', formData.timeCommitment);
    newErrors.roles = validateField('roles', formData.roles);
    newErrors.creatorRole = validateField('creatorRole', formData.creatorRole);

    // Filter out empty errors
    const hasErrors = Object.values(newErrors).some((error) => error !== '');

    if (hasErrors) {
      setErrors(newErrors);
      setTouchedFields({
        title: true,
        description: true,
        category: true,
        timeCommitment: true,
        roles: true,
        creatorRole: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[CreateProjectModal] Submitting project to API...');

      // Call real API
      const response = await apiClient.createProject({
        title: toTitleCase(formData.title),
        description: formData.description,
        category: formData.category,
        timeCommitment: formData.timeCommitment,
        duration: formData.duration,
        roles: formData.roles
          .filter((r) => r.title.trim())
          .map((r) => ({ title: r.title, description: r.description })),
        creatorRole: formData.creatorRole,
        existingMembers: formData.existingMembers.filter((m) => m.name.trim()),
      });

      console.log('[CreateProjectModal] Project created successfully:', response.data);

      // Call parent callback with the created project
      // Normalize ID field to ensure compatibility with HomePage
      if (onProjectCreated && response.data) {
        onProjectCreated({
          ...response.data,
          id: response.data.id || response.data._id
        });
      }

      // Show success and close modal after delay
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('[CreateProjectModal] Error creating project:', error);
      setIsSubmitting(false);
      setErrors({
        ...errors,
        general: error.response?.data?.message || 'Failed to create project. Please try again.',
      });
    }
  };

  const progress = calculateProgress();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
            <p className="text-sm text-slate-500 mt-1">
              Fill in the details to start building your team
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Form Completion</span>
            <span className="text-xs font-bold text-orange-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 flex-1" style={{ paddingBottom: '120px' }}>
          <form onSubmit={handleSubmit} id="create-project-form">
            {/* Section 1: Project Basics */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold mr-3">
                  1
                </span>
                Project Basics
              </h3>

              {/* Project Title */}
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                  {touchedFields.title && !errors.title && formData.title && (
                    <CheckCircleIcon className="inline h-4 w-4 text-green-600 ml-2" />
                  )}
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.title && touchedFields.title
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-orange-500'
                  } focus:ring-2 focus:border-transparent outline-none transition-all`}
                  placeholder="e.g., Campus Events Platform, AI Study Buddy, Sustainable Fashion App, Mental Health Tracker"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={() => handleBlur('title')}
                />
                {errors.title && touchedFields.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Project Description */}
              <div className="mb-5">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Project Description <span className="text-red-500">*</span>
                  {touchedFields.description && !errors.description && formData.description && (
                    <CheckCircleIcon className="inline h-4 w-4 text-green-600 ml-2" />
                  )}
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.description && touchedFields.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-orange-500'
                  } focus:ring-2 focus:border-transparent outline-none transition-all resize-none`}
                  rows={4}
                  placeholder="Describe your project, its goals, target users, and the impact you want to create. What problem does it solve? What technologies will you use?"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={() => handleBlur('description')}
                />
                {errors.description && touchedFields.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div className="mb-5">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                  {touchedFields.category && !errors.category && formData.category && (
                    <CheckCircleIcon className="inline h-4 w-4 text-green-600 ml-2" />
                  )}
                </label>
                <select
                  id="category"
                  name="category"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category && touchedFields.category
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-orange-500'
                  } focus:ring-2 focus:border-transparent outline-none transition-all`}
                  value={formData.category}
                  onChange={(e) => {
                    handleChange(e);
                    console.log('[CreateProjectModal] Selected category:', e.target.value);
                  }}
                  onBlur={() => handleBlur('category')}
                >
                  <option value="">Select category</option>
                  <option value="Tech">Tech</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Case Competitions">Case Competitions</option>
                  <option value="Hackathons">Hackathons</option>
                </select>
                {errors.category && touchedFields.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

            </div>

            {/* Section 2: Project Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold mr-3">
                  2
                </span>
                Project Timeline
              </h3>

              {/* Time Commitment */}
              <div className="mb-5">
                <label htmlFor="timeCommitment" className="block text-sm font-medium text-slate-700 mb-2">
                  Time Commitment per Week <span className="text-red-500">*</span>
                  {touchedFields.timeCommitment && !errors.timeCommitment && formData.timeCommitment && (
                    <CheckCircleIcon className="inline h-4 w-4 text-green-600 ml-2" />
                  )}
                </label>
                <div className="relative">
                  <select
                    id="timeCommitment"
                    name="timeCommitment"
                    className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border ${
                      errors.timeCommitment && touchedFields.timeCommitment
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 focus:ring-orange-500'
                    } focus:ring-2 focus:border-transparent outline-none transition-all cursor-pointer bg-white`}
                    value={formData.timeCommitment}
                    onChange={(e) => handleSelectChange('timeCommitment', e.target.value)}
                    onBlur={() => handleBlur('timeCommitment')}
                  >
                    <option value="">Select time commitment</option>
                    <option value="Less than 5 hours">Less than 5 hours</option>
                    <option value="5-10 hours">5-10 hours</option>
                    <option value="10-20 hours">10-20 hours</option>
                    <option value="20-30 hours">20-30 hours</option>
                    <option value="30+ hours">30+ hours</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  How many hours per week will team members need to commit?
                </p>
                {errors.timeCommitment && touchedFields.timeCommitment && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeCommitment}</p>
                )}
              </div>

              {/* Project Duration */}
              <div className="mb-5">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-2">
                  Project Duration (weeks)
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    Recommended
                  </span>
                  <button
                    type="button"
                    className="ml-2 relative inline-block"
                    onMouseEnter={() => setShowDurationTooltip(true)}
                    onMouseLeave={() => setShowDurationTooltip(false)}
                  >
                    <InfoIcon className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    {showDurationTooltip && (
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                        Providing a timeline helps potential team members understand the commitment
                        level and plan accordingly
                        <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    )}
                  </button>
                </label>
                <div className="space-y-4">
                  {/* Smooth continuous slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      id="duration"
                      name="duration"
                      min="1"
                      max="52"
                      step="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer duration-slider"
                    />

                    {/* Simple min/max labels */}
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>1 week</span>
                      <span>52 weeks</span>
                    </div>
                  </div>

                  {/* Current value display with number input */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center">
                      <span className="inline-block px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-semibold text-lg">
                        {formData.duration} {formData.duration === 1 ? 'week' : 'weeks'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.duration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const clampedValue = Math.min(Math.max(value, 1), 52);
                        setFormData({ ...formData, duration: clampedValue });
                      }}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      placeholder="Weeks"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Estimated timeline helps members plan their commitment
                </p>
              </div>
            </div>

            {/* Section 3: Team Composition */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold mr-3">
                  3
                </span>
                Team Composition
              </h3>

              {/* Team Roles Needed */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Team Roles Needed <span className="text-red-500">*</span>
                  {touchedFields.roles &&
                    !errors.roles &&
                    formData.roles.filter((r) => r.title.trim()).length > 0 && (
                      <CheckCircleIcon className="inline h-4 w-4 text-green-600 ml-2" />
                    )}
                </label>
                <div className="space-y-4">
                  {formData.roles.map((role, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-900">Role #{index + 1}</h4>
                        {formData.roles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRole(index)}
                            className="text-slate-500 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove role"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm text-slate-700 mb-1">Role Title</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                          placeholder="e.g., UI/UX Designer, Backend Developer, ML Engineer, Product Manager, Data Analyst"
                          value={role.title}
                          onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-1">
                          Role Description
                        </label>
                        <textarea
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                          rows={2}
                          placeholder="e.g., Looking for someone with Figma experience and user research skills, Need a React developer familiar with Next.js, Seeking data scientist with Python and TensorFlow knowledge"
                          value={role.description}
                          onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRole}
                    className="flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Another Role
                  </button>
                </div>
                {errors.roles && touchedFields.roles && (
                  <p className="mt-2 text-sm text-red-600">{errors.roles}</p>
                )}
              </div>

              {/* Team Members Already Onboard - Expandable Section */}
              <div className="border border-slate-200 rounded-lg p-4 bg-blue-50">
                <button
                  type="button"
                  onClick={() => setShowExistingMembers(!showExistingMembers)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h4 className="font-medium text-slate-900 flex items-center">
                      Team Members Already Onboard
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Optional
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Add team members who have already committed to the project
                    </p>
                  </div>
                  {showExistingMembers ? (
                    <ChevronUpIcon className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-slate-500" />
                  )}
                </button>

                {showExistingMembers && (
                  <div className="mt-4 space-y-4">
                    {formData.existingMembers.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800 flex items-center">
                          <InfoIcon className="h-4 w-4 mr-2" />
                          Added members will receive a confirmation notification
                        </p>
                      </div>
                    )}

                    {formData.existingMembers.map((member, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-slate-900">Member #{index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeExistingMember(index)}
                            className="text-slate-500 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                            aria-label="Remove member"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-slate-700 mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                              placeholder="Team member name"
                              value={member.name}
                              onChange={(e) =>
                                handleExistingMemberChange(index, 'name', e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-700 mb-1">
                              Profile Link
                            </label>
                            <input
                              type="url"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                              placeholder="https://matchbox.com/profile/..."
                              value={member.profileLink}
                              onChange={(e) =>
                                handleExistingMemberChange(index, 'profileLink', e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm text-slate-700 mb-1">Role</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                            placeholder="Their role in the project"
                            value={member.role}
                            onChange={(e) =>
                              handleExistingMemberChange(index, 'role', e.target.value)
                            }
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm text-slate-700 mb-1">
                            Role Description
                          </label>
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                            rows={2}
                            placeholder="What they'll be working on"
                            value={member.description}
                            onChange={(e) =>
                              handleExistingMemberChange(index, 'description', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addExistingMember}
                      className="flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Team Member
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Your Role - Visually Distinct */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
                  <UserIcon className="h-6 w-6 text-orange-600 mr-3" />
                  Your Role in This Project <span className="text-red-500 ml-1">*</span>
                  {touchedFields.creatorRole &&
                    !errors.creatorRole &&
                    formData.creatorRole.title && (
                      <CheckCircleIcon className="inline h-5 w-5 text-green-600 ml-2" />
                    )}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  As the project creator, define your role and contribution to help potential
                  teammates understand the project leadership
                </p>

                {/* Creator Role Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Role Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`appearance-none w-full px-4 py-3 pr-10 rounded-lg border ${
                        errors.creatorRole && touchedFields.creatorRole
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-orange-500'
                      } focus:ring-2 focus:border-transparent outline-none transition-all cursor-pointer bg-white`}
                      value={formData.creatorRole.title}
                      onChange={(e) => handleCreatorRoleChange('title', e.target.value)}
                      onBlur={() => handleBlur('creatorRole')}
                    >
                      <option value="">Select your role</option>
                      <option value="Project Lead">Project Lead</option>
                      <option value="Technical Lead">Technical Lead</option>
                      <option value="Design Lead">Design Lead</option>
                      <option value="Product Owner">Product Owner</option>
                      <option value="Engineering Manager">Engineering Manager</option>
                      <option value="Research Lead">Research Lead</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.creatorRole && touchedFields.creatorRole && (
                    <p className="mt-1 text-sm text-red-600">{errors.creatorRole}</p>
                  )}
                </div>

                {/* Your Responsibilities */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Responsibilities
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    rows={3}
                    placeholder="What will you be responsible for? e.g., Project planning, technical architecture, design system creation, team coordination..."
                    value={formData.creatorRole.responsibilities}
                    onChange={(e) => handleCreatorRoleChange('responsibilities', e.target.value)}
                  />
                </div>

                {/* Your Expertise */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Expertise / What You Bring
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
                    rows={3}
                    placeholder="What skills and experience do you bring? e.g., 3 years React experience, Figma expert, Product management background..."
                    value={formData.creatorRole.expertise}
                    onChange={(e) => handleCreatorRoleChange('expertise', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="border-t border-slate-200 bg-white p-6 flex justify-between items-center flex-shrink-0 shadow-lg">
          <div className="text-sm text-slate-600">
            {progress < 100 ? (
              <span>
                Complete all required fields (<span className="font-semibold">{progress}%</span>)
              </span>
            ) : (
              <span className="text-green-600 font-semibold flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                All required fields completed!
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-project-form"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting || progress < 100}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </div>

        {/* Success Message Overlay */}
        {isSubmitting && progress === 100 && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Project Created!</h3>
              <p className="text-slate-600">Redirecting you back...</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Custom slider styling */
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CreateProjectModal;
