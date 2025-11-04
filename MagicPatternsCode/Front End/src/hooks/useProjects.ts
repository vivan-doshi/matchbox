import { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import type { Project, ProjectFilters, CreateProjectRequest, UpdateProjectRequest } from '../types/api';

/**
 * Custom hook for managing projects
 */
export const useProjects = (filters?: ProjectFilters) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjects(filters);

      if (response.success) {
        setProjects(response.data);
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: CreateProjectRequest) => {
    try {
      const response = await apiClient.createProject(data);
      if (response.success && response.data) {
        setProjects((prev) => [response.data!, ...prev]);
        return response.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create project';
      throw new Error(message);
    }
  };

  const updateProject = async (id: string, data: UpdateProjectRequest) => {
    try {
      const response = await apiClient.updateProject(id, data);
      if (response.success && response.data) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? response.data! : p))
        );
        return response.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update project';
      throw new Error(message);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete project';
      throw new Error(message);
    }
  };

  return {
    projects,
    loading,
    error,
    pagination,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

/**
 * Hook for fetching a single project
 */
export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getProjectById(id);

      if (response.success && response.data) {
        setProject(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
  };
};
