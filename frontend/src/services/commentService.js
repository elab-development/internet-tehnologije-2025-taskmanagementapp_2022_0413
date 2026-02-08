import api from './api';

const commentService = {
  getCommentsByTask: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },

  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

export default commentService;