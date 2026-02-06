const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email već postoji.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'Korisnik uspešno kreiran.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password, currentPassword } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === parseInt(req.params.id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Nemate dozvolu za ovu akciju.' });
    }

    if (role && !isAdmin) {
      return res.status(403).json({ error: 'Samo admin može menjati uloge.' });
    }

    if (password && !isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Trenutna lozinka je obavezna.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Pogrešna trenutna lozinka.' });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email već postoji.' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && isAdmin) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await user.update(updateData);

    res.json({
      message: 'Korisnik ažuriran.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === parseInt(req.params.id);

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Nemate dozvolu za brisanje ovog naloga.' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } });
      if (adminCount === 1) {
        return res.status(400).json({ error: 'Ne možete obrisati poslednjeg admina.' });
      }
    }

    await user.destroy();
    res.json({ message: 'Korisnik obrisan.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};