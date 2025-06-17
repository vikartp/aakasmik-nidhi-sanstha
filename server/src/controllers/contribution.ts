import { Request, Response } from "express";
import Contribution from "../models/Contribution";
import Screenshot from '../models/Screenshot';

// Helper to get numeric month from month string
const getMonthIndex = (monthStr: string) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    return months.indexOf(monthStr);
};

export const createContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can create contributions' });
            return;
        }
        // Validate required fields
        const { userId, month, year, amount, screenshotId } = req.body;
        if (!userId || !month || !year || !amount) {
            res.status(400).json({ error: 'Missing required fields: userId, month, year, amount' });
            return;
        }
        // Prevent creating contribution for a future month
        const now = new Date();
        const reqMonthIdx = getMonthIndex(month);
        const nowMonthIdx = now.getMonth();
        const reqYear = Number(year);
        if (
            reqYear > now.getFullYear() ||
            (reqYear === now.getFullYear() && reqMonthIdx > nowMonthIdx)
        ) {
            res.status(400).json({ error: 'Cannot create contribution for a future month.' });
            return;
        }
        // Upsert contribution (atomic)
        const contributionData = {
            userId,
            month,
            year,
            amount,
            screenshotId,
            verifiedBy: req.user._id,
        };
        const updatedContribution = await Contribution.findOneAndUpdate(
            { userId, month, year },
            { $set: contributionData },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        // If screenshotId is present, mark screenshot as verified
        if (screenshotId) {
            await Screenshot.findByIdAndUpdate(screenshotId, { verified: true });
        }
        res.status(200).json(updatedContribution);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: errorMessage });
        return;
    }
};

export const getAllContributions = async (req: Request, res: Response) => {
    try {
        const contributions = await Contribution.find().sort({ year: -1, month: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionsByUser = async (req: Request, res: Response) => {
    const userId = req.params.userid;
    try {
        const contributions = await Contribution.find({ userId }).sort({ year: -1, month: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionsByYearAndMonth = async (req: Request, res: Response) => {
    const { year, month } = req.params;
    try {
        const contributions = await Contribution.find({ year, month }).sort({ createdAt: -1 });
        res.status(200).json(contributions);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const getContributionById = async (req: Request, res: Response) => {
    try {
        const contribution = await Contribution.findById(req.params.id);
        if (!contribution) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(contribution);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};

export const updateContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can update contributions' });
            return;
        };
        const updated = await Contribution.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json(updated);
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(400).json({ error: errorMessage });
        return;
    }
};

export const deleteContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can delete contributions' });
            return;
        };
        const deleted = await Contribution.findByIdAndDelete(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: 'Not found' });
            return;
        }
        res.status(200).json({ message: 'Deleted successfully' });
        return;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
        return;
    }
};
