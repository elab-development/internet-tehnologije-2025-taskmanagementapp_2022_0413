import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import listService from '../services/listService';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import TaskChart from '../components/TaskChart';

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('aktivan');
  const [myTasks, setMyTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [taskSearchTerm, setTaskSearchTerm] = useState('');
  const [taskFilters, setTaskFilters] = useState({
    priority: '',
    status: '',
    sortBy: 'created_at'
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    deadline: '',
  });
  const [createError, setCreateError] = useState('');
  const [projectProgress, setProjectProgress] = useState({});

  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = projects;
    if (projectFilter !== 'svi') filtered = filtered.filter(p => p.status === projectFilter);
    if (projectSearchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(projectSearchTerm.toLowerCase()))
      );
    }
    setFilteredProjects(filtered);
  }, [projectSearchTerm, projects, projectFilter]);

  useEffect(() => {
    let filtered = [...myTasks];
    
    if (taskSearchTerm.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(taskSearchTerm.toLowerCase()))
      );
    }
    
    if (taskFilters.priority) {
      filtered = filtered.filter(t => t.priority === taskFilters.priority);
    }
    
    if (taskFilters.status) {
      filtered = filtered.filter(t => t.status === taskFilters.status);
    }
    
    filtered.sort((a, b) => {
      switch (taskFilters.sortBy) {
        case 'priority': {
          const priorityOrder = { visok: 0, srednji: 1, nizak: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'deadline': {
          const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          return aDeadline - bDeadline;
        }
        default: {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      }
    });
    
    setFilteredTasks(filtered);
  }, [taskSearchTerm, myTasks, taskFilters]);

  const calculateProjectProgress = async (projectsData) => {
    const progressData = {};
    
    for (const project of projectsData) {
      try {
        const lists = await listService.getListsByProject(project.id);
        let totalTasks = 0;
        let completedTasks = 0;
        
        for (const list of lists) {
          const tasks = await taskService.getTasksByList(list.id);
          totalTasks += tasks.length;
          completedTasks += tasks.filter(t => t.status === 'završeno').length;
        }
        
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        progressData[project.id] = {
          progress,
          totalTasks,
          completedTasks
        };
      } catch (error) {
        console.error(`Error calculating progress for project ${project.id}:`, error);
        progressData[project.id] = { progress: 0, totalTasks: 0, completedTasks: 0 };
      }
    }
    
    setProjectProgress(progressData);
  };

  const fetchData = async () => {
    try {
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAllProjects(),
        taskService.getAllTasks({ assigned_to: user.id }),
      ]);
      setProjects(projectsData);
      setMyTasks(tasksData);
      
      await calculateProjectProgress(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await projectService.createProject(newProject);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '', deadline: '' });
      fetchData();
    } catch (error) {
      if (error.response?.data?.details) {
        setCreateError(error.response.data.details.map(e => e.message).join(', '));
      } else {
        setCreateError(error.response?.data?.error || 'Greška pri kreiranju projekta');
      }
      setTimeout(() => setCreateError(''), 5000);
    }
  };

  const completionRate = myTasks.length > 0 
    ? Math.round((myTasks.filter(t => t.status === 'završeno').length / myTasks.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-700/50 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Hero */}
        <div className="mb-8 animate-fade-in">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/80 backdrop-blur-sm p-8 shadow-lg border border-slate-700/50">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-slate-100 mb-2">
                Dobrodošli, {user?.name}! 
              </h1>
              <p className="text-slate-400 text-lg">
                Broj vaših aktivnih zadataka: {myTasks.filter(t => t.status !== 'završeno').length}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up">
          
          {/* Total Projects */}
          <div className="group bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-primary-500/20 transition-all duration-300 hover:-translate-y-1 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  {projects.length}
                </p>
              </div>
            </div>
            <p className="text-slate-300 font-medium">Ukupno projekata</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"></div>
          </div>

          {/* Active Tasks */}
          <div className="group bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {myTasks.filter(t => t.status !== 'završeno').length}
                </p>
              </div>
            </div>
            <p className="text-slate-300 font-medium">Aktivni zadaci</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>

          {/* Completed Tasks */}
          <div className="group bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {myTasks.filter(t => t.status === 'završeno').length}
                </p>
              </div>
            </div>
            <p className="text-slate-300 font-medium">Završeni zadaci</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
          </div>

          {/* Completion Rate */}
          <div className="group bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {completionRate}%
                </p>
              </div>
            </div>
            <p className="text-slate-300 font-medium">Završeno</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Projekti</h2>
            {isManager && (
              <Button onClick={() => setShowCreateModal(true)}>
                + Novi projekat
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Pretraži projekte..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100 placeholder-slate-500"
              />
              <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
            >
              <option value="svi">Svi statusi</option>
              <option value="aktivan">Aktivni</option>
              <option value="arhiviran">Arhivirani</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-slate-700/50">
              <div className="text-slate-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-slate-400">
                {projectSearchTerm || projectFilter !== 'svi' ? 'Nema rezultata' : 'Nema dostupnih projekata'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const progress = projectProgress[project.id]?.progress || 0;
                const totalTasks = projectProgress[project.id]?.totalTasks || 0;
                const completedTasks = projectProgress[project.id]?.completedTasks || 0;
                
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="group bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-primary-500/30 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-primary-500/50 hover:-translate-y-1"
                  >
                    <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className={`px-3 py-1 rounded-lg font-medium ${
                        project.status === 'aktivan' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
      
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {project.status}
                      </span>
                      {project.deadline && (
                        <span className="text-slate-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(project.deadline).toLocaleDateString('sr-RS')}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Napredak ({completedTasks}/{totalTasks})</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500" 
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Section */}
<div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Moji zadaci</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Pretraži zadatke..."
                value={taskSearchTerm}
                onChange={(e) => setTaskSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100 placeholder-slate-500"
              />
              <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={taskFilters.priority}
              onChange={(e) => setTaskFilters({...taskFilters, priority: e.target.value})}
              className="px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
            >
              <option value="">Svi prioriteti</option>
              <option value="visok">Visok</option>
              <option value="srednji">Srednji</option>
              <option value="nizak">Nizak</option>
            </select>
            <select
              value={taskFilters.status}
              onChange={(e) => setTaskFilters({...taskFilters, status: e.target.value})}
              className="px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
            >
              <option value="">Svi statusi</option>
              <option value="planirano">Planirano</option>
              <option value="u toku">U toku</option>
              <option value="završeno">Završeno</option>
            </select>
            <select
              value={taskFilters.sortBy}
              onChange={(e) => setTaskFilters({...taskFilters, sortBy: e.target.value})}
              className="px-4 py-3 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
            >
              <option value="created_at">Najnovije</option>
              <option value="deadline">Po roku</option>
              <option value="priority">Po prioritetu</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-slate-700/50">
              <div className="text-slate-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-slate-400">
                {taskSearchTerm || taskFilters.priority || taskFilters.status ? 'Nema rezultata' : 'Nema dodeljenih zadataka'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const priorityColors = {
                  visok: 'from-purple-500 to-violet-500',
                  srednji: 'from-blue-500 to-cyan-500',
                  nizak: 'from-slate-500 to-slate-400'
                };
                const statusColors = {
                  'završeno': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                  'u toku': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
                  'planirano': 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                };
                
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/projects/${task.list?.project?.id}`)}
                    className="group bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 shadow-lg hover:shadow-primary-500/30 transition-all duration-300 cursor-pointer border-l-4 border-primary-500 hover:border-primary-400"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-slate-100 flex-1 group-hover:text-primary-400 transition-colors">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${statusColors[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r ${priorityColors[task.priority]} text-white`}>
                        {task.priority}
                      </span>
                      {task.deadline && (
                        <span className="text-xs text-slate-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(task.deadline).toLocaleDateString('sr-RS')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
          <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Statistika zadataka</h2>
          <TaskChart />
          </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={showCreateModal} onClose={() => {
        setShowCreateModal(false);
        setCreateError('');
      }} title="Novi projekat">
        <form onSubmit={handleCreateProject}>
          <Input
            label="Naziv projekta"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Opis</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
            />
          </div>
          <Input
            label="Rok"
            type="date"
            value={newProject.deadline}
            onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
            min={today}
          />
          
          {createError && (
            <div className="mt-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg text-sm">
              {createError}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Otkaži</Button>
            <Button type="submit">Kreiraj</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DashboardPage;