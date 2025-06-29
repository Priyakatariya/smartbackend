// express-backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json(users);
  } catch (err: any) {
    console.error('Error in getAllUsers:', err.message);
    res.status(500).send('Server Error');
  }
};