import api from './api';

const projectService = {
  // Get all projects
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  // Get single project
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Add member to project
  addMember: async (projectId, userId) => {
    const response = await api.post(`/projects/${projectId}/members`, { user_id: userId });
    return response.data;
  },

  // Remove member from project
  removeMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/members`, { data: { user_id: userId } });
    return response.data;
  },
};

export default projectService;