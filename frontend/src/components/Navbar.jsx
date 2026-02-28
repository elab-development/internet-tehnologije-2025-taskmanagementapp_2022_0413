import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';


const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-all duration-200"
            >
              Dashboard
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-all duration-200"
              >
                Admin panel
              </Link>
            )}

            <Link
              to="/profile"
              className="px-4 py-2 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 font-medium transition-all duration-200"
            >
              Profil
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Avatar name={user?.name} role={user?.role} size="md" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrator' : user?.role === 'project_manager' ? 'Menadžer' : 'Korisnik'}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-glow border border-gray-100 py-2 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Moj profil
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Odjavi se
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;