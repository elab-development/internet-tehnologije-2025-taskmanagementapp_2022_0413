import api from './api';

const listService = {
  getListsByProject: async (projectId) => {
    const response = await api.get(`/lists/project/${projectId}`);
    return response.data;
  },

  createList: async (listData) => {
    const response = await api.post('/lists', listData);
    return response.data;
  },

  updateList: async (id, listData) => {
    const response = await api.put(`/lists/${id}`, listData);
    return response.data;
  },

  deleteList: async (id) => {
    const response = await api.delete(`/lists/${id}`);
    return response.data;
  },
};

export default listService;