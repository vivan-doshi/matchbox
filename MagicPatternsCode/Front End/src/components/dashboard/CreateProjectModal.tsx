import React, { useState } from 'react';
import { XIcon, PlusIcon, TrashIcon } from 'lucide-react';
import apiClient from '../../utils/apiClient';
import type { Project } from '../../types/api';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [''],
    roles: [{
      title: '',
      description: ''
    }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({
      ...formData,
      tags: newTags
    });
  };
  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };
  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tags: newTags
    });
  };
  const handleRoleChange = (index: number, field: string, value: string) => {
    const newRoles = [...formData.roles];
    newRoles[index] = {
      ...newRoles[index],
      [field]: value
    };
    setFormData({
      ...formData,
      roles: newRoles
    });
  };
  const addRole = () => {
    setFormData({
      ...formData,
      roles: [...formData.roles, {
        title: '',
        description: ''
      }]
    });
  };
  const removeRole = (index: number) => {
    const newRoles = formData.roles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      roles: newRoles
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty tags and prepare roles
      const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
      const filteredRoles = formData.roles.filter(role => role.title.trim() !== '');

      if (filteredRoles.length === 0) {
        setError('Please add at least one role');
        setLoading(false);
        return;
      }

      // Create project via API
      const response = await apiClient.createProject({
        title: formData.title,
        description: formData.description,
        tags: filteredTags,
        roles: filteredRoles,
      });

      console.log('Project created successfully:', response.data);

      // Notify parent component
      if (onProjectCreated && response.data) {
        onProjectCreated(response.data);
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                Project Title
              </label>
              <input id="title" name="title" type="text" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Campus Events Platform" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Project Description
              </label>
              <textarea id="description" name="description" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" rows={4} placeholder="Describe your project, its goals, and what you're looking to build..." value={formData.description} onChange={handleChange} required />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags
              </label>
              <div className="space-y-3">
                {formData.tags.map((tag, index) => <div key={index} className="flex items-center">
                    <input type="text" className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Web, Mobile, AI" value={tag} onChange={e => handleTagChange(index, e.target.value)} />
                    {formData.tags.length > 1 && <button type="button" onClick={() => removeTag(index)} className="ml-2 text-slate-500 hover:text-red-500">
                        <TrashIcon className="h-5 w-5" />
                      </button>}
                  </div>)}
                <button type="button" onClick={addTag} className="flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Tag
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Team Roles Needed
              </label>
              <div className="space-y-4">
                {formData.roles.map((role, index) => <div key={index} className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Role #{index + 1}</h4>
                      {formData.roles.length > 1 && <button type="button" onClick={() => removeRole(index)} className="text-slate-500 hover:text-red-500">
                          <TrashIcon className="h-4 w-4" />
                        </button>}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-slate-700 mb-1">
                        Role Title
                      </label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. UI/UX Designer" value={role.title} onChange={e => handleRoleChange(index, 'title', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-700 mb-1">
                        Role Description
                      </label>
                      <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all" placeholder="e.g. Looking for someone with Figma experience" value={role.description} onChange={e => handleRoleChange(index, 'description', e.target.value)} />
                    </div>
                  </div>)}
                <button type="button" onClick={addRole} className="flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Another Role
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </div>
    </div>;
};
export default CreateProjectModal;