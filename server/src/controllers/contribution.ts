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

interface ContributionPayload {
    userId: string;
    screenshotId?: string;
    amount: number;
    contributionDate: Date;
}

export const createContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can create contributions' });
            return;
        }
        // Validate required fields
        const { userId, amount, contributionDate, screenshotId } = <ContributionPayload>req.body;
        if (!userId || !amount || !contributionDate) {
            res.status(400).json({ error: 'Missing required fields: userId, amount, contributionDate' });
            return;
        }
        // Prevent creating contribution for a future date (allow any time today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const contribDate = new Date(contributionDate);
        contribDate.setHours(0, 0, 0, 0);
        if (contribDate > today) {
            res.status(400).json({ error: 'Cannot create contribution for a future date' });
            return;
        }
        // Upsert contribution (atomic)
        const contributionData = {
            userId,
            contributionDate,
            amount,
            screenshotId,
            verifiedBy: req.user.name,
        };
        const updatedContribution = await Contribution.findOneAndUpdate(
            { userId, contributionDate },
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
        const contributions = await Contribution.find().sort({ contributionDate: -1 });
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
        const contributions = await Contribution.find({ userId }).sort({ contributionDate: -1 });
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
        // Find all contributions where contributionDate is in the given year and month
        const start = new Date(Number(year), getMonthIndex(month), 1);
        const end = new Date(Number(year), getMonthIndex(month) + 1, 1);
        const contributions = await Contribution.find({
            contributionDate: { $gte: start, $lt: end }
        }).sort({ contributionDate: -1 });
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

export const getTotalContributionAmount = async (req: Request, res: Response) => {
    try {
        const total = await Contribution.aggregate([
            { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
        ]);
        res.status(200).json({ total: total[0]?.totalAmount || 0 });
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
