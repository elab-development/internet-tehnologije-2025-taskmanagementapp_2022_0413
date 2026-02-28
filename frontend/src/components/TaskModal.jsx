import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import commentService from '../services/commentService';
import taskService from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ task, isOpen, onClose, onUpdate, onDelete, users = [], projectDeadline = null }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [updateError, setUpdateError] = useState('');
  const { user, isManager, isAdmin } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (task && isOpen) {
      setEditedTask(task);
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    try {
      const data = await commentService.getCommentsByTask(task.id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentService.createComment({
        task_id: task.id,
        content: newComment,
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editedCommentText.trim()) {
      alert('Komentar ne može biti prazan');
      return;
    }

    try {
      await commentService.updateComment(commentId, { content: editedCommentText });
      setEditingCommentId(null);
      setEditedCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati komentar?')) return;

    try {
      await commentService.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleUpdateTask = async () => {
    setUpdateError('');
    
    try {
      await taskService.updateTask(task.id, editedTask);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
      
      if (error.response?.data?.details) {
        const errorMsg = error.response.data.details.map(e => e.message).join(', ');
        setUpdateError(errorMsg);
      } else if (error.response?.data?.error) {
        setUpdateError(error.response.data.error);
      } else {
        setUpdateError('Greška pri ažuriranju zadatka');
      }
      
      setTimeout(() => setUpdateError(''), 5000);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Da li ste sigurni da želite obrisati zadatak?')) return;

    try {
      await taskService.deleteTask(task.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!task) return null;

  const canEdit = isManager || task.assigned_to === user.id;
  const canDelete = isManager;
  const maxTaskDeadline = projectDeadline || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Uredi zadatak' : task.title} size="lg">
      <div className="space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            {isManager ? (
              <Input
                label="Naziv"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Naziv</label>
                <p className="text-lg font-semibold text-slate-100">{task.title}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Opis</label>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
              />
            </div>
            {isManager && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Prioritet</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
                  >
                    <option value="nizak">Nizak</option>
                    <option value="srednji">Srednji</option>
                    <option value="visok">Visok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Dodeljen</label>
                  <select
                    value={editedTask.assigned_to || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, assigned_to: e.target.value || null })}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
                  >
                    <option value="">Nije dodeljen</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    label="Rok"
                    type="date"
                    value={editedTask.deadline || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                    min={today}
                    max={maxTaskDeadline}
                  />
                  {maxTaskDeadline && (
                    <p className="text-xs text-slate-400 mt-1">Rok ne može biti posle roka projekta ({new Date(maxTaskDeadline).toLocaleDateString('sr-RS')})</p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100"
              >
                <option value="planirano">Planirano</option>
                <option value="u toku">U toku</option>
                <option value="završeno">Završeno</option>
              </select>
            </div>
            
            {updateError && (
              <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg text-sm">
                {updateError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Otkaži</Button>
              <Button onClick={handleUpdateTask}>Sačuvaj</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-1">Opis</h4>
                <p className="text-slate-200">{task.description || 'Nema opisa'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Prioritet</h4>
                  <span className={`inline-block mt-1 px-3 py-1.5 text-sm font-medium rounded-md ${
                    task.priority === 'visok' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    task.priority === 'srednji' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Status</h4>
                  <span className={`inline-block mt-1 px-3 py-1.5 text-sm font-medium rounded-md ${
                    task.status === 'završeno' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    task.status === 'u toku' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
              {task.assignee && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Dodeljen</h4>
                  <p className="text-slate-200">{task.assignee.name}</p>
                </div>
              )}
              {task.deadline && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Rok</h4>
                  <p className="text-slate-200">{new Date(task.deadline).toLocaleDateString('sr-RS')}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between border-t border-slate-700 pt-4 mb-6">
              {canEdit && <Button variant="outline" onClick={() => setIsEditing(true)}>Uredi</Button>}
              {canDelete && <Button variant="danger" onClick={handleDeleteTask}>Obriši</Button>}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Komentari ({comments.length})</h3>
              
              <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Dodaj komentar..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                />
                <div className="flex justify-end mt-2">
                  <Button type="submit" size="sm" disabled={!newComment.trim()}>
                    Dodaj komentar
                  </Button>
                </div>
              </form>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">Nema komentara</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-slate-200">{comment.author.name}</span>
                          <span className="text-sm text-slate-500 ml-2">
                            {new Date(comment.created_at).toLocaleString('sr-RS')}
                          </span>
                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <span className="text-xs text-slate-500 ml-2">(izmenjeno)</span>
                          )}
                        </div>
                        {(comment.user_id === user.id || user.role === 'admin') && (
                          <div className="flex space-x-2">
                            {comment.user_id === user.id && editingCommentId !== comment.id && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditedCommentText(comment.content);
                                }}
                                className="text-indigo-400 hover:text-indigo-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {(comment.user_id === user.id || user.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-purple-400 hover:text-purple-300"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div>
                          <textarea
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            rows="2"
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 text-slate-100"
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditedCommentText('');
                              }}
                            >
                              Otkaži
                            </Button>
                            <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                              Sačuvaj
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-300">{comment.content}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskModal;