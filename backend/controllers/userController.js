import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { ref, push, set, get } from 'firebase/database';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, seniorDoctorId, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (role === 'Junior Doctor' && !seniorDoctorId) {
      return res.status(400).json({ error: 'Junior Doctor must be assigned to a Senior Doctor' });
    }

    // Check if user already exists
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const emailExists = Object.values(users).some(u => u.email === email);
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Firebase
    const newUserRef = push(usersRef);
    const newUserData = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString()
    };
    if (role === 'Junior Doctor') {
      newUserData.seniorDoctorId = seniorDoctorId;
    }
    if (address) {
      newUserData.address = address;
    }

    await set(newUserRef, newUserData);

    // Send email
    const mailOptions = {
      from: `"SmartCareConnect Admin" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your SmartCareConnect Account Details',
      text: `Hello ${name},\n\nYour account has been created.\nRole: ${role}\nEmail: ${email}\nPassword: ${password}${address ? `\nAddress: ${address}` : ''}\n\nPlease login at the portal.\n\nThanks,\nAdmin`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Email sending failed, but user was created:', mailError);
    }

    res.status(201).json({ id: newUserRef.key, name, email, role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const snapshot = await get(ref(db, 'users'));
    if (snapshot.exists()) {
      const users = snapshot.val();
      // Remove passwords before sending to client
      const usersList = Object.entries(users).map(([id, data]) => {
        const { password, ...rest } = data;
        return { id, ...rest };
      });
      res.status(200).json(usersList);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
