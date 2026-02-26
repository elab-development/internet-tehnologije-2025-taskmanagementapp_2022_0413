import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import taskService from '../services/taskService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const TaskChart = () => {
  const [stats, setStats] = useState({
    planirano: 0,
    'u toku': 0,
    završeno: 0
  });
  const [priorityStats, setPriorityStats] = useState({
    visok: 0,
    srednji: 0,
    nizak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasks = await taskService.getAllTasks();
        
        const statusCount = { planirano: 0, 'u toku': 0, završeno: 0 };
        const priorityCount = { visok: 0, srednji: 0, nizak: 0 };
        
        tasks.forEach(task => {
          if (statusCount[task.status] !== undefined) {
            statusCount[task.status]++;
          }
          if (priorityCount[task.priority] !== undefined) {
            priorityCount[task.priority]++;
          }
        });
        
        setStats(statusCount);
        setPriorityStats(priorityCount);
      } catch (error) {
        console.error('Greška pri učitavanju statistike:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const doughnutData = {
    labels: ['Planirano', 'U toku', 'Završeno'],
    datasets: [
      {
        data: [stats.planirano, stats['u toku'], stats.završeno],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Visok', 'Srednji', 'Nizak'],
    datasets: [
      {
        label: 'Broj zadataka',
        data: [priorityStats.visok, priorityStats.srednji, priorityStats.nizak],
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(300, 300, 300, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(300, 300, 300, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 20,
          font: { size: 13 }
        }
      },
      title: {
        display: true,
        text: 'Status zadataka',
        color: '#e2e8f0',
        font: { size: 16, weight: 'bold' }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Zadaci po prioritetu',
        color: '#e2e8f0',
        font: { size: 16, weight: 'bold' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#94a3b8', stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = stats.planirano + stats['u toku'] + stats.završeno;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Doughnut chart */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">Ukupno zadataka: <span className="text-slate-100 font-semibold">{total}</span></p>
        </div>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>

      {/* Bar chart */}
      <div className="bg-slate-800/90 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">Raspodela po prioritetu</p>
        </div>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default TaskChart;