import { Request, Response } from "express";
import Contribution from "../models/Contribution";

export const createContribution = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admins can create contributions' });
            return;
        };
        const contribution = new Contribution(req.body);
        const saved = await contribution.save();
        res.status(201).json(saved);
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
