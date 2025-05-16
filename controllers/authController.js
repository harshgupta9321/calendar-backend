import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {

  const { email, password } = req.body; // Changed from username to email
  const user = await User.findOne({ email }); // Changed from username to email

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({ token, role: user.role });
};

export const createManager = async (req, res) => {
  const { email, password, role } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can create credentials' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });

  try {
    await user.save();
    res.status(201).json({ message: `${role} created` });
  } catch (error) {
    // Handle errors like duplicate email
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'manager',
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};