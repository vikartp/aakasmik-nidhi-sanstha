import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}