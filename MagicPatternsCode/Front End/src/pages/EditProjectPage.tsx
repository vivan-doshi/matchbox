import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  SaveIcon,
} from 'lucide-react';
import apiClient from '../utils/apiClient';
import { Project, UpdateProjectRequest } from '../types/api';
import Navigation from '../components/Navigation';

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
  status: 'Planning' | 'In Progress' | 'Completed';
}

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    timeCommitment: '',
    duration: 8,
    roles: [],
    status: 'Planning',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient.getProjectById(id);

      if (response.success && response.data) {
        const proj = response.data;
        setProject(proj);

        // Populate form with existing data
        setFormData({
          title: proj.title,
          description: proj.description,
          category: proj.category || '',
          timeCommitment: proj.timeCommitment || '',
          duration: proj.duration || 8,
          roles: proj.roles.map(role => ({
            title: role.title,
            description: role.description,
          })),
          status: proj.status,
        });
      }
    } catch (error: any) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleRoleChange = (index: number, field: string, value: string) => {
    const updatedRoles = [...formData.roles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    setFormData({ ...formData, roles: updatedRoles });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, { title: '', description: '' }],
    });
  };

  const removeRole = (index: number) => {
    const updatedRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({ ...formData, roles: updatedRoles });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) return;

    try {
      setSaving(true);

      const updateData: UpdateProjectRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        timeCommitment: formData.timeCommitment,
        duration: formData.duration,
        roles: formData.roles.filter(role => role.title.trim() !== ''),
        status: formData.status,
      };

      const response = await apiClient.updateProject(id, updateData);

      if (response.success) {
        alert('Project updated successfully!');
        navigate(`/project/${id}`);
      }
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-background-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cardinal border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background-gradient">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/project/${id}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
              </button>
              <h1 className="text-2xl font-bold">Edit Project</h1>
            </div>
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="text-slate-500 hover:text-slate-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                placeholder="Enter project title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                placeholder="Describe your project"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Research">Research</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Time Commitment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Time Commitment
              </label>
              <select
                value={formData.timeCommitment}
                onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
              >
                <option value="">Select time commitment</option>
                <option value="1-5 hours/week">1-5 hours/week</option>
                <option value="5-10 hours/week">5-10 hours/week</option>
                <option value="10-20 hours/week">10-20 hours/week</option>
                <option value="20+ hours/week">20+ hours/week</option>
              </select>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 8)}
                min="1"
                max="52"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'Planning' | 'In Progress' | 'Completed')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Roles */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Team Roles
                </label>
                <button
                  type="button"
                  onClick={addRole}
                  className="flex items-center gap-2 px-3 py-1 bg-cardinal text-white rounded-lg hover:bg-cardinal transition-colors text-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Role
                </button>
              </div>

              <div className="space-y-4">
                {formData.roles.map((role, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-slate-600">Role {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
                      placeholder="Role title (e.g., Frontend Developer)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    />
                    <textarea
                      value={role.description}
                      onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                      placeholder="Role description and responsibilities"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    />
                  </div>
                ))}

                {formData.roles.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No roles added yet. Click "Add Role" to create team positions.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate(`/project/${id}`)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <SaveIcon className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;
