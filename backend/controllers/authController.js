import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { ref, get, child } from 'firebase/database';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (res, user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check manager first (from env)
    if (email === process.env.MANAGER_EMAIL && password === process.env.MANAGER_PASSWORD) {
      const managerUser = { id: 'manager', email, role: 'Manager', name: 'Admin Manager' };
      generateToken(res, managerUser);
      return res.status(200).json(managerUser);
    }

    // Otherwise, check Firebase RTDB for other users
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users`));
    
    if (snapshot.exists()) {
      const users = snapshot.val();
      let foundUser = null;
      let userId = null;

      for (const [key, user] of Object.entries(users)) {
        if (user.email === email) {
          foundUser = user;
          userId = key;
          break;
        }
      }

      if (foundUser) {
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (isMatch) {
          const userPayload = { id: userId, email: foundUser.email, role: foundUser.role, name: foundUser.name };
          generateToken(res, userPayload);
          return res.status(200).json(userPayload);
        }
      }
    }

    res.status(401).json({ error: 'Invalid email or password' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  res.status(200).json(req.user);
};
