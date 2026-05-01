import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { ref, get, child, update } from 'firebase/database';
import sendEmail from '../utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (res, user) => {
  const token = jwt.sign(
    { ...user },
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
      const managerUser = { id: 'manager', email, role: 'Manager', name: 'Hospital Manager' };
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
          const userPayload = { id: userId, ...foundUser };
          delete userPayload.password; // Don't include password in token
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

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (userId === 'manager') {
      return res.status(403).json({ error: 'Manager password cannot be changed here' });
    }

    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}`));
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = snapshot.val();
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Use dynamic import for update to avoid top-level issues if any
    const { update: updateRef } = await import('firebase/database');
    await updateRef(ref(db, `users/${userId}`), { password: hashedPassword });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if manager (reject as per request)
    if (email === process.env.MANAGER_EMAIL) {
      return res.status(403).json({ error: 'Manager password cannot be reset via this method' });
    }

    // Find user in Firebase
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users`));
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const users = snapshot.val();
    let foundUserId = null;

    for (const [key, user] of Object.entries(users)) {
      if (user.email === email) {
        foundUserId = key;
        break;
      }
    }

    if (!foundUserId) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate reset token (15 mins)
    const resetToken = jwt.sign({ id: foundUserId }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: email,
        subject: 'SmartCareConnect - Password Reset Request',
        message: message,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #4f46e5;">Password Reset</h2>
            <p>You requested to reset your password for SmartCareConnect.</p>
            <p>Click the button below to set a new password. This link is valid for 15 minutes.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            <p style="font-size: 12px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser: <br/> ${resetUrl}</p>
          </div>
        `
      });

      res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (err) {
      console.error('Email error:', err);
      return res.status(500).json({ error: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (userId === 'manager') {
      return res.status(403).json({ error: 'Manager password cannot be reset via this method' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update in Firebase
    await update(ref(db, `users/${userId}`), { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please request a new link.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
