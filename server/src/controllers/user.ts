import { Request, Response } from 'express';
import User from '../models/User';
import { deleteUserScreenshots } from '../utils/screenshots';

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
        await deleteUserScreenshots(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const makeAdmin = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.role = 'admin';
        user.verified = true; // Automatically verify when making admin
        await user.save();
        res.status(200).json({ message: 'User role updated to admin', user });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const verifyMember = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.verified = true;
        await user.save();
        res.status(200).json({ message: 'User verified successfully', user });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}