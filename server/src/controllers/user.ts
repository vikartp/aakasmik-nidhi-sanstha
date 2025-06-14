import { Request, Response } from 'express';
import User from '../models/User';
import UserSecret from '../models/Secret';
import { deleteUserScreenshots } from '../utils/screenshots';
import { omit } from 'lodash';
import { generateRandomString } from '../utils/user';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const getLoggedInUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const user = await User.findById(req.user._id, "-password");
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId, "-password");
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
        res.status(200).json({ message: 'User role updated to admin', user: omit(user, ['password']) });
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

export const getSecretByMobile = async (req: Request, res: Response): Promise<void> => {
    const mobile = req.params.mobile;
    try {
        if (mobile.length !== 10) {
            res.status(400).json({ message: 'Invalid mobile number format. It should be 10 digits long.' });
            return;
        }
        const secretKey = await UserSecret.findOne({ mobile });
        if (!secretKey) {
            console.log(`No secret found for mobile: ${mobile}. Generating a new secret.`);
            const newSecret = generateRandomString();
            const createdSecret = await UserSecret.create({
                mobile,
                secret: newSecret,
                createdAt: new Date(),
                createdBy: req.user?._id || 'system'
            });
            res.status(200).json({ message: 'Secret retrieved successfully', secret: createdSecret.secret });
        } else {
            console.log(`Secret found for mobile: ${mobile}`);
            res.status(200).json({ message: 'Secret retrieved successfully', secret: secretKey.secret });
        }
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
        return;
    }
}