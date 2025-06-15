import { Router } from "express";
import {
    createContribution,
    getAllContributions,
    getContributionsByUser,
    getContributionsByYearAndMonth,
    getContributionById,
    updateContribution,
    deleteContribution
} from "../controllers/contribution";

const router = Router();

// Create a new contribution
router.post('/', createContribution);

// Get all contributions
router.get('/', getAllContributions);

// Get contributions by user ID
router.get('/:userid', getContributionsByUser);

// Get contributions by year and month
router.get('/year/:year/month/:month', getContributionsByYearAndMonth);

// Get a single contribution by contribution ID
router.get('/contribution/:id', getContributionById);

// Update a contribution by ID
router.put('/:id', updateContribution);

// Delete a contribution by ID
router.delete('/:id', deleteContribution);

export default router;