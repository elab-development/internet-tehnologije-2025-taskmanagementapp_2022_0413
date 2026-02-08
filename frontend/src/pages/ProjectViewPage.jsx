import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import projectService from '../services/projectService';
import listService from '../services/listService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const ProjectViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [project, setProject] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState({});
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const [newList, setNewList] = useState({ name: '' });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'srednji',
    assigned_to: '',
    deadline: '',
  });
  const [editedProject, setEditedProject] = useState({
    name: '',
    description: '',
    deadline: '',
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [projectError, setProjectError] = useState('');
  const [taskError, setTaskError] = useState('');

  useEffect(() => {
    fetchProjectData();
    if (isManager) {
      fetchAllUsers();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectData, listsData] = await Promise.all([
        projectService.getProjectById(id),
        listService.getListsByProject(id),
      ]);

      setProject(projectData);
      setLists(listsData);
      setUsers(projectData.members || []);
      setEditedProject({
        name: projectData.name,
        description: projectData.description || '',
        deadline: projectData.deadline || '',
      });

      const tasksData = {};
      for (const list of listsData) {
        const listTasks = await taskService.getTasksByList(list.id);
        tasksData[list.id] = listTasks;
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching project data:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      await listService.createList({ project_id: id, name: newList.name });
      setShowNewListModal(false);
      setNewList({ name: '' });
      fetchProjectData();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setNewList({ name: list.name });
    setShowEditListModal(true);
  };

  const handleUpdateList = async (e) => {
    e.preventDefault();
    try {
      await listService.updateList(editingList.id, { name: newList.name });
      setShowEditListModal(false);
      setEditingList(null);
      setNewList({ name: '' });
      fetchProjectData();
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Da li ste sigurni? Svi zadaci u ovoj listi će biti obrisani.')) return;
    try {
      await listService.deleteList(listId);
      fetchProjectData();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    try {
      const taskData = {
        ...newTask,
        list_id: selectedList
      };
      
      if (!isManager) {
        taskData.assigned_to = user.id;
      }
      
      await taskService.createTask(taskData);
      setShowNewTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'srednji', assigned_to: '', deadline: '' });
      fetchProjectData();
    } catch (error) {
      if (error.response?.data?.details) {
        setTaskError(error.response.data.details.map(e => e.message).join(', '));
      } else {
        setTaskError(error.response?.data?.error || 'Greška pri kreiranju zadatka');
      }
      setTimeout(() => setTaskError(''), 5000);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setProjectError('');
    try {
      await projectService.updateProject(id, editedProject);
      setShowEditProjectModal(false);
      fetchProjectData();
    } catch (error) {
      if (error.response?.data?.details) {
        setProjectError(error.response.data.details.map(e => e.message).join(', '));
      } else {
        setProjectError(error.response?.data?.error || 'Greška pri ažuriranju projekta');
      }
      setTimeout(() => setProjectError(''), 5000);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectService.addMember(id, userId);
      fetchProjectData();
      if (isManager) fetchAllUsers();
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Da li ste sigurni da želite ukloniti člana?')) return;
    try {
      await projectService.removeMember(id, userId);
      fetchProjectData();
      if (isManager) fetchAllUsers();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceListId = parseInt(source.droppableId.split('-')[1]);
    const destListId = parseInt(destination.droppableId.split('-')[1]);
    const taskId = parseInt(draggableId.split('-')[1]);

    const newTasks = { ...tasks };
    const sourceTasks = Array.from(newTasks[sourceListId] || []);
    const destTasks = sourceListId === destListId 
      ? sourceTasks 
      : Array.from(newTasks[destListId] || []);

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (sourceListId === destListId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      newTasks[sourceListId] = sourceTasks;
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      newTasks[sourceListId] = sourceTasks;
      newTasks[destListId] = destTasks;
    }

    setTasks(newTasks);

    try {
      const destList = lists.find(l => l.id === destListId);
      const updateData = {
        list_id: destListId,
        position: destination.index + 1,
      };

      if (destList) {
        const listName = destList.name.toLowerCase();
        if (listName.includes('planirano') || listName.includes('to do') || listName.includes('todo')) {
          updateData.status = 'planirano';
        } else if (listName.includes('u toku') || listName.includes('in progress') || listName.includes('doing')) {
          updateData.status = 'u toku';
        } else if (listName.includes('završeno') || listName.includes('done') || listName.includes('completed')) {
          updateData.status = 'završeno';
        }
      }

      await taskService.updateTask(taskId, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      fetchProjectData();
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const availableUsers = allUsers.filter(u => !users.some(member => member.id === u.id));
  const maxTaskDeadline = project?.deadline || null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-slate-700 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-100">{project?.name}</h1>
              {project?.description && <p className="text-slate-400 mt-2">{project.description}</p>}
              <div className="flex items-center space-x-4 mt-4">
                {project?.deadline && (
                  <span className="text-sm text-slate-400">Rok: {new Date(project.deadline).toLocaleDateString('sr-RS')}</span>
                )}
                <span className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  project?.status === 'aktivan' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}>
                  {project?.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowMembersModal(true)}>
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Članovi ({users.length})
              </Button>
              {isManager && (
                <>
                  <Button variant="outline" onClick={() => setShowEditProjectModal(true)}>Uredi projekat</Button>
                  <Button variant="outline" onClick={() => setShowNewListModal(true)}>+ Nova lista</Button>
                  <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>Obriši</Button>
                </>
              )}
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-slate-100">
                        {list.name}
                        <span className="ml-2 text-sm text-slate-400">({tasks[list.id]?.length || 0})</span>
                      </h3>
                      {isManager && (
                        <div className="flex space-x-1 ml-2">
                          <button onClick={() => handleEditList(list)} className="text-slate-400 hover:text-primary-400" title="Uredi listu">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteList(list.id)} className="text-slate-400 hover:text-purple-400" title="Obriši listu">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedList(list.id); setShowNewTaskModal(true); }}>+</Button>
                  </div>
                  <Droppable droppableId={`list-${list.id}`}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                        {tasks[list.id]?.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} onClick={() => openTaskModal(task)} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {showTaskModal && selectedTask && (
        <TaskModal task={selectedTask} isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setSelectedTask(null); }} onUpdate={fetchProjectData} onDelete={fetchProjectData} users={users} projectDeadline={project?.deadline} />
      )}

      <Modal isOpen={showNewListModal} onClose={() => setShowNewListModal(false)} title="Nova lista">
        <form onSubmit={handleCreateList}>
          <Input label="Naziv liste" value={newList.name} onChange={(e) => setNewList({ name: e.target.value })} required />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowNewListModal(false)}>Otkaži</Button>
            <Button type="submit">Kreiraj</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditListModal} onClose={() => setShowEditListModal(false)} title="Uredi listu">
        <form onSubmit={handleUpdateList}>
          <Input label="Naziv liste" value={newList.name} onChange={(e) => setNewList({ name: e.target.value })} required />
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEditListModal(false)}>Otkaži</Button>
            <Button type="submit">Sačuvaj</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showNewTaskModal} onClose={() => { setShowNewTaskModal(false); setTaskError(''); }} title="Novi zadatak">
        <form onSubmit={handleCreateTask}>
          {taskError && <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg mb-4 text-sm">{taskError}</div>}
          <Input label="Naziv zadatka" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Opis</label>
            <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows="3" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Prioritet</label>
            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100">
              <option value="nizak">Nizak</option>
              <option value="srednji">Srednji</option>
              <option value="visok">Visok</option>
            </select>
          </div>
          {isManager && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Dodeli</label>
              <select value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100">
                <option value="">Nije dodeljeno</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}
          <Input 
            label="Rok" 
            type="date" 
            value={newTask.deadline} 
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} 
            min={today}
            max={maxTaskDeadline}
          />
          {maxTaskDeadline && (
            <p className="text-xs text-slate-400 mt-1">Rok ne može biti posle roka projekta ({new Date(maxTaskDeadline).toLocaleDateString('sr-RS')})</p>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowNewTaskModal(false)}>Otkaži</Button>
            <Button type="submit">Kreiraj</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditProjectModal} onClose={() => { setShowEditProjectModal(false); setProjectError(''); }} title="Uredi projekat">
        <form onSubmit={handleUpdateProject}>
          {projectError && <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg mb-4 text-sm">{projectError}</div>}
          <Input label="Naziv projekta" value={editedProject.name} onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Opis</label>
            <textarea value={editedProject.description} onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })} rows="3" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100" />
          </div>
          <Input label="Rok" type="date" value={editedProject.deadline} onChange={(e) => setEditedProject({ ...editedProject, deadline: e.target.value })} min={today} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select value={editedProject.status || project?.status} onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100">
              <option value="aktivan">Aktivan</option>
              <option value="arhiviran">Arhiviran</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEditProjectModal(false)}>Otkaži</Button>
            <Button type="submit">Sačuvaj</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} title="Obriši projekat">
        <div className="mb-4">
          <p className="text-slate-300 mb-4">Ova akcija je neopoziva. Svi zadaci i liste će biti obrisani.</p>
          <p className="text-slate-300 mb-2">Unesite <strong>{project?.name}</strong> da potvrdite:</p>
          <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Unesite naziv projekta" />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Otkaži</Button>
          <Button variant="danger" onClick={handleDeleteProject} disabled={deleteConfirmText !== project?.name}>Obriši</Button>
        </div>
      </Modal>

      <Modal isOpen={showMembersModal} onClose={() => setShowMembersModal(false)} title="Članovi projekta">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Članovi projekta</h3>
            <div className="space-y-2">
              {users.map(member => (
                <div key={member.id} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-200">{member.name}</span>
                  {isManager && (
                    <button onClick={() => handleRemoveMember(member.id)} className="text-purple-400 hover:text-purple-300 text-sm">Ukloni</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {isManager && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Dodaj člana</h3>
              <div className="space-y-2">
                {availableUsers.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                    <span className="text-slate-200">{member.name}</span>
                    <button onClick={() => handleAddMember(member.id)} className="text-primary-400 hover:text-primary-300 text-sm">Dodaj</button>
                  </div>
                ))}
                {availableUsers.length === 0 && <p className="text-slate-400 text-sm">Nema dostupnih korisnika</p>}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectViewPage;