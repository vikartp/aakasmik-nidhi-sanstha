import { Router } from 'express';
import FeedbackModel from '../models/Feedback';
import { Request, Response } from 'express';

const router = Router();

// POST /feedback - Create feedback
router.post('/', async (req: Request, res: Response) => {
    try {
        const { content, target } = req.body;
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        if (!content || !target) {
            res.status(400).json({ message: 'Content and target are required' });
            return;
        }
        if (!['admin', 'superadmin'].includes(target)) {
            res.status(400).json({ message: 'Invalid target' });
            return;
        }

        const feedback = new FeedbackModel({
            userName: user.name,
            fatherName: user.fatherName,
            content,
            target,
        });
        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit feedback', error: err });
    }
});

// GET /feedback - Get feedbacks based on user role
router.get('/', async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        let filter = {};
        if (user.role === 'admin') {
            filter = { target: 'admin' };
        } else if (user.role === 'superadmin') {
            // superadmin can see all
            filter = { target: 'superadmin' };
        } else {
            // members can't see feedbacks
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        const feedbacks = await FeedbackModel.find(filter).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedbacks', error: err });
    }
});

// DELETE /feedback/:id - Delete feedback by id
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const feedback = await FeedbackModel.findById(req.params.id);
        if (!feedback) {
            res.status(404).json({ message: 'Feedback not found' });
            return;
        }
        // Only superadmin can delete any feedback, admin can delete only admin feedback
        if (user.role === 'superadmin' || (user.role === 'admin' && feedback.target === 'admin')) {
            await feedback.deleteOne();
            res.json({ message: 'Feedback deleted' });
            return;
        }
        res.status(403).json({ message: 'Forbidden' });
        return;
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete feedback', error: err });
    }
});

export default router;