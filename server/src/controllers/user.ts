import { Request, Response } from 'express';
import User from '../models/User';

export const getUsers = async (req : Request, res : Response) : Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}