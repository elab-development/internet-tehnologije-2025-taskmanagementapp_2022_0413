import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [adminCount, setAdminCount] = useState(0);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      checkAdminCount();
    } else {
      setCheckingAdmins(false);
    }
  }, [user]);

  const checkAdminCount = async () => {
    try {
      const response = await api.get('/users');
      const admins = response.data.filter(u => u.role === 'admin');
      setAdminCount(admins.length);
    } catch (err) {
      console.error('Error checking admin count:', err);
    } finally {
      setCheckingAdmins(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('Nove lozinke se ne poklapaju');
      setLoading(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      setError('Nova lozinka mora imati najmanje 8 karaktera');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      await api.put(`/users/${user.id}`, updateData);

      setSuccess('Profil uspešno ažuriran!');
      setIsEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      const updatedUser = { ...user, name: formData.name, email: formData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri ažuriranju profila');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user?.role === 'admin' && adminCount === 1) {
      alert('Ne možete obrisati nalog jer ste poslednji administrator u sistemu. Prvo morate dodeliti admin ulogu drugom korisniku.');
      return;
    }

    if (!window.confirm('Da li ste sigurni da želite da obrišete nalog? Ova akcija je neopoziva!')) {
      return;
    }

    const confirmText = prompt('Unesite "OBRIŠI" da potvrdite:');
    if (confirmText !== 'OBRIŠI') {
      alert('Brisanje otkazano');
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Greška pri brisanju naloga');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nepoznato';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Nepoznato';
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}.`;
    } catch (e) {
      console.error('Date formatting error:', e, dateString);
      return 'Nepoznato';
    }
  };

  const isLastAdmin = user?.role === 'admin' && adminCount === 1;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Moj profil</h1>
          <p className="text-slate-400 mt-2">Upravljajte svojim podacima</p>
        </div>

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Card>
          {!isEditing ? (
            <div>
              <div className="flex items-center mb-6 pb-6 border-b border-slate-700">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mr-6">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">{user?.name}</h2>
                  <p className="text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Ime i prezime</h3>
                  <p className="text-lg text-slate-100">{user?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Email adresa</h3>
                  <p className="text-lg text-slate-100">{user?.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Uloga</h3>
                  <span className={`inline-block mt-1 px-3 py-1.5 text-sm font-medium rounded-md ${
                    user?.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    user?.role === 'project_manager' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                  }`}>
                    {user?.role === 'admin' ? 'Administrator' :
                     user?.role === 'project_manager' ? 'Projektni menadžer' :
                     'Korisnik'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Član od</h3>
                  <p className="text-lg text-slate-100">{formatDate(user?.created_at)}</p>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-700">
                <Button onClick={() => setIsEditing(true)}>
                  Uredi profil
                </Button>
                <Button 
                  variant="danger" 
                  onClick={handleDeleteAccount}
                  disabled={isLastAdmin || checkingAdmins}
                  title={isLastAdmin ? 'Ne možete obrisati nalog jer ste poslednji administrator' : ''}
                >
                  Obriši nalog
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4 mb-6">
                <Input
                  label="Ime i prezime"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Email adresa"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Promena lozinke (opciono)</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trenutna lozinka</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Unesite trenutnu lozinku"
                        className="w-full px-4 py-2.5 pr-12 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showCurrentPassword ? (
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nova lozinka</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Minimum 8 karaktera"
                        className="w-full px-4 py-2.5 pr-12 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showNewPassword ? (
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">Potvrda nove lozinke</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ponovite novu lozinku"
                        className="w-full px-4 py-2.5 pr-12 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showConfirmPassword ? (
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
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setError('');
                  }}
                  disabled={loading}
                >
                  Otkaži
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;