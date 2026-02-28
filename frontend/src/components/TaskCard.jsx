import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const TaskCard = ({ task, index, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'visok':
        return 'border-l-2 border-purple-500';
      case 'srednji':
        return 'border-l-2 border-blue-500';
      case 'nizak':
        return 'border-l-2 border-slate-400';
      default:
        return 'border-l-2 border-slate-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'visok':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'srednji':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'nizak':
        return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'završeno';

  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-slate-800/90 rounded-lg border border-slate-700 p-4 mb-3 cursor-grab active:cursor-grabbing
            transition-all duration-200
            hover:border-slate-600 hover:bg-slate-800
            ${getPriorityColor(task.priority)}
            ${snapshot.isDragging ? 'opacity-50 shadow-2xl scale-105' : 'opacity-100'}
          `}
        >
          <h4 className="font-semibold text-slate-100 mb-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${getPriorityBadge(task.priority)}`}>
                {task.priority}
              </span>

              {task.assignee && (
                <div className="flex items-center text-xs text-slate-400">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {task.assignee.name.split(' ')[0]}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {task.deadline && (
                <div className={`flex items-center text-xs ${isOverdue ? 'text-purple-400 font-medium' : 'text-slate-400'}`}>
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.deadline).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}
                </div>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) {
                    onClick(task);
                  }
                }}
                className="p-1 rounded hover:bg-slate-700 transition-colors"
                title="Prikaži detalje"
                type="button"
              >
                <svg className="w-4 h-4 text-slate-400 hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;