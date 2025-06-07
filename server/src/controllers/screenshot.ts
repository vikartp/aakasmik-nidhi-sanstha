import { Request, Response } from 'express';
import Screenshot from '../models/Screenshot';

export const uploadScreenshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageUrl = (<any>req).file?.path;
    const userId = req.body.userId;
    if (!imageUrl) throw new Error('No image provided');

    const screenshot = new Screenshot({ user: userId, imageUrl });
    await screenshot.save();
    res.status(201).json({ message: 'Screenshot uploaded', screenshot });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};