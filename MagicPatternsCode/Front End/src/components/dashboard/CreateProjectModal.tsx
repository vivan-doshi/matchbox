import React, { useState } from 'react';
import { XIcon, PlusIcon, TrashIcon } from 'lucide-react';
interface CreateProjectModalProps {
  onClose: () => void;
}
const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to the backend
    console.log(formData);
    onClose();
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
          </form>
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:shadow-md transition-all">
            Create Project
          </button>
        </div>
      </div>
    </div>;
};
export default CreateProjectModal;