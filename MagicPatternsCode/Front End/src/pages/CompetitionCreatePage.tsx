import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Trash2, Calendar, Users, Target, Award, Menu } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { CreateCompetitionRequest, Milestone } from '../types/api';
import Navigation from '../components/Navigation';
import NotificationBell from '../components/notifications/NotificationBell';

const CompetitionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCompetitionRequest>({
    title: '',
    description: '',
    type: 'hackathon',
    startDate: '',
    endDate: '',
    maxTeamSize: 5,
    minTeamSize: 2,
    rules: '',
    objectives: '',
    evaluationCriteria: '',
    prize: '',
    milestones: [
      {
        order: 1,
        title: 'Kickoff',
        description: 'Competition begins',
        dueDate: '',
        isRequired: true,
      },
    ],
    requiresHostApproval: false,
    allowSelfTeams: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMilestoneChange = (
    index: number,
    field: keyof Omit<Milestone, '_id'>,
    value: string | number | boolean
  ) => {
    setFormData((prev) => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      return { ...prev, milestones: newMilestones };
    });
  };

  const addMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          order: prev.milestones.length + 1,
          title: '',
          description: '',
          dueDate: '',
          isRequired: false,
        },
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length === 1) {
      alert('You must have at least one milestone');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index).map((m, i) => ({ ...m, order: i + 1 })),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Competition title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Competition description is required');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    if (formData.minTeamSize > formData.maxTeamSize) {
      setError('Minimum team size cannot be greater than maximum team size');
      return false;
    }
    if (!formData.rules.trim()) {
      setError('Competition rules are required');
      return false;
    }
    if (!formData.objectives.trim()) {
      setError('Competition objectives are required');
      return false;
    }
    if (formData.milestones.length === 0) {
      setError('At least one milestone is required');
      return false;
    }
    for (let i = 0; i < formData.milestones.length; i++) {
      const milestone = formData.milestones[i];
      if (!milestone.title.trim()) {
        setError(`Milestone ${i + 1} title is required`);
        return false;
      }
      if (!milestone.dueDate) {
        setError(`Milestone ${i + 1} due date is required`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createCompetition(formData);

      if (response.success && response.data) {
        alert('Competition created successfully!');
        navigate(`/competitions/${response.data.id || response.data._id}`);
      } else {
        setError(response.message || 'Failed to create competition');
      }
    } catch (err: any) {
      console.error('Error creating competition:', err);
      setError(err.response?.data?.message || 'Failed to create competition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-gray-900">Create Competition</h1>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <Navigation isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-cardinal" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Spring AI Hackathon 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed overview of the competition..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="case-competition">Case Competition</option>
                  <option value="group-project">Group Project</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Min Team Size *
                  </label>
                  <input
                    type="number"
                    name="minTeamSize"
                    value={formData.minTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="h-4 w-4 inline mr-1" />
                    Max Team Size *
                  </label>
                  <input
                    type="number"
                    name="maxTeamSize"
                    value={formData.maxTeamSize}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Teams (Optional)
                </label>
                <input
                  type="number"
                  name="maxTeams"
                  value={formData.maxTeams || ''}
                  onChange={handleInputChange}
                  placeholder="Leave blank for unlimited"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rules & Objectives */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-cardinal" />
              <h2 className="text-xl font-semibold text-gray-900">Rules & Objectives</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Rules *
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  placeholder="Define the rules participants must follow..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Objectives *
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleInputChange}
                  placeholder="What should participants achieve..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluation Criteria (Optional)
                </label>
                <textarea
                  name="evaluationCriteria"
                  value={formData.evaluationCriteria}
                  onChange={handleInputChange}
                  placeholder="How will teams be judged..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="h-4 w-4 inline mr-1" />
                  Prize/Reward (Optional)
                </label>
                <input
                  type="text"
                  name="prize"
                  value={formData.prize}
                  onChange={handleInputChange}
                  placeholder="e.g., $1000 cash prize, certificates, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cardinal" />
                <h2 className="text-xl font-semibold text-gray-900">Milestones</h2>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-2 px-4 py-2 bg-cardinal text-white rounded-lg hover:bg-cardinal-light transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Milestone {index + 1}</h3>
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                        placeholder="e.g., Prototype Submission"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        placeholder="Brief description of this milestone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          value={milestone.dueDate}
                          onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          value={milestone.weight || ''}
                          onChange={(e) =>
                            handleMilestoneChange(index, 'weight', parseInt(e.target.value) || 0)
                          }
                          placeholder="e.g., 40"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cardinal focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`milestone-required-${index}`}
                        checked={milestone.isRequired}
                        onChange={(e) =>
                          handleMilestoneChange(index, 'isRequired', e.target.checked)
                        }
                        className="h-4 w-4 text-cardinal border-gray-300 rounded focus:ring-cardinal"
                      />
                      <label
                        htmlFor={`milestone-required-${index}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        Required milestone (cannot be skipped)
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="requiresHostApproval"
                  name="requiresHostApproval"
                  checked={formData.requiresHostApproval}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cardinal border-gray-300 rounded focus:ring-cardinal mt-1"
                />
                <label htmlFor="requiresHostApproval" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Require host approval for teams</span>
                  <p className="text-sm text-gray-500">Teams must be approved by you before they can participate</p>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="allowSelfTeams"
                  name="allowSelfTeams"
                  checked={formData.allowSelfTeams}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-cardinal border-gray-300 rounded focus:ring-cardinal mt-1"
                />
                <label htmlFor="allowSelfTeams" className="ml-3">
                  <span className="text-sm font-medium text-gray-900">Allow individuals to participate alone</span>
                  <p className="text-sm text-gray-500">Participants can form one-person teams if needed</p>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/competitions')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cardinal to-cardinal-light text-white rounded-lg hover:from-cardinal-light hover:to-red-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionCreatePage;
