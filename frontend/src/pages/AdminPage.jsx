import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Card from '../components/Card';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const AdminPage = () => {
  const { user: currentUser } = useAuth(); 
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminCount = () => {
    return users.filter(u => u.role === 'admin').length;
  };

  const isLastAdmin = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.role === 'admin' && getAdminCount() === 1;
  };

  const isEditingLastAdmin = () => {
    return selectedUser?.role === 'admin' && getAdminCount() === 1;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera');
      return;
    }

    try {
      await userService.createUser(formData);
      setShowCreateModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowPassword(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri kreiranju korisnika');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');

    if (isEditingLastAdmin() && formData.role !== 'admin') {
      setError('Ne možete promeniti ulogu poslednjeg administratora. Prvo dodelite admin ulogu drugom korisniku.');
      return;
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    if (formData.password) {
      if (formData.password.length < 8) {
        setError('Lozinka mora imati najmanje 8 karaktera');
        return;
      }
      updateData.password = formData.password;
    }

    try {
      await userService.updateUser(selectedUser.id, updateData);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user' });
      setShowPassword(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri ažuriranju korisnika');
    }
  };

  const handleDeleteUser = async (userId) => {

    if (isLastAdmin(userId)) {
      alert('Ne možete obrisati poslednjeg administratora u sistemu. Prvo dodelite admin ulogu drugom korisniku.');
      return;
    }

    if (!window.confirm('Da li ste sigurni da želite obrisati ovog korisnika?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Greška pri brisanju korisnika');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'project_manager':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'user':
        return 'bg-slate-500/10 text-slate-300 border border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'project_manager':
        return 'Projektni menadžer';
      case 'user':
        return 'Korisnik';
      default:
        return role;
    }
  };

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

  const adminCount = getAdminCount();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Admin panel</h1>
              <p className="text-slate-400 mt-2">Upravljanje korisnicima</p>
              {/* Broja admina */}
              <p className="text-slate-500 text-sm mt-1">Ukupno administratora: {adminCount}</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Pretraži korisnike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                  icon={
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novi korisnik
              </Button>
            </div>
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Uloga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Datum kreiranja</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.map((user) => {
                  const isUserLastAdmin = isLastAdmin(user.id);
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-200">
                          {user.name}
                          
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="text-sm text-slate-400">{user.email}</div></td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-md ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(user.created_at).toLocaleDateString('sr-RS')}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button 
                          onClick={() => handleEditUser(user)} 
                          className="text-primary-400 hover:text-primary-300 mr-4"
                        >
                          Uredi
                        </button>
                        {/* Disabled dugme */}
                        <button 
                          onClick={() => handleDeleteUser(user.id)} 
                          className={`${isUserLastAdmin ? 'text-slate-600 cursor-not-allowed' : 'text-purple-400 hover:text-purple-300'}`}
                          disabled={isUserLastAdmin}
                          title={isUserLastAdmin ? 'Ne možete obrisati poslednjeg administratora' : ''}
                        >
                          Obriši
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormData({ name: '', email: '', password: '', role: 'user' }); setError(''); setShowPassword(false); }} title="Novi korisnik">
        <form onSubmit={handleCreateUser}>
          {error && <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          <Input label="Ime i prezime" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Lozinka <span className="text-purple-400">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-12 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Uloga</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100">
              <option value="user">Korisnik</option>
              <option value="project_manager">Projektni menadžer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Otkaži</Button>
            <Button type="submit">Kreiraj</Button>
          </div>
        </form>
      </Modal>
      
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedUser(null); setFormData({ name: '', email: '', password: '', role: 'user' }); setError(''); setShowPassword(false); }} title="Uredi korisnika">
        <form onSubmit={handleUpdateUser}>
          {error && <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
          
          {/* Upozorenje */}
          {isEditingLastAdmin() && (
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}
              Ovo je poslednji administrator u sistemu.<br></br>Ne možete mu promeniti ulogu.
            </div>
          )}
          
          <Input label="Ime i prezime" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Nova lozinka (ostavite prazno ako ne menjate)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-12 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Uloga</label>
            {/* Ne može da obriše ako je poslednji admin */}
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
              className={`w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100 ${isEditingLastAdmin() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isEditingLastAdmin()}
            >
              <option value="user">Korisnik</option>
              <option value="project_manager">Projektni menadžer</option>
              <option value="admin">Administrator</option>
            </select>
            {isEditingLastAdmin() && (
              <p className="mt-1 text-xs text-slate-500">
                Ne možete promeniti ulogu dok ste poslednji administrator
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Otkaži</Button>
            <Button type="submit">Sačuvaj</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPage;