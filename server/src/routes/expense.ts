import { Router } from "express";
import expenseModel from "../models/Expense";
import { Request, Response } from "express";

const router = Router();

// Create a new expense
router.post("/", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: "Forbidden: Only admins can create expenses" });
            return;
        }
        const { amount, description } = req.body;
        // Validate input
        if (!amount || typeof amount !== 'number' || typeof description !== 'string') {
            res.status(400).json({ error: "Invalid input data" });
            return;
        }
        const updatedBy = req.user?.name || "unknown";
        const newExpense = await expenseModel.create({ amount, description, updatedBy });
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ error: "Failed to create expense", details: error });
    }
});

// Get all expenses
router.get("/", async (req: Request, res: Response) => {
    try {
        const expenses = await expenseModel.find();
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch expenses", details: error });
    }
});

// Update an expense by ID
router.put("/:id", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: "Forbidden: Only admins can update expenses" });
            return;
        }
        const { id } = req.params;
        const { amount, description } = req.body;
        const updatedBy = req.user?.name || "unknown";
        const updatedExpense = await expenseModel.findByIdAndUpdate(
            id,
            { amount, description, updatedBy },
            { new: true, runValidators: true }
        );
        if (!updatedExpense) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        res.status(200).json(updatedExpense);
        return;
    } catch (error) {
        res.status(500).json({ error: "Failed to update expense", details: error });
        return;
    }
});

// Delete an expense by ID
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: "Forbidden: Only admins can delete expenses" });
            return;
        }
        const { id } = req.params;
        const deletedExpense = await expenseModel.findByIdAndDelete(id);
        if (!deletedExpense) {
            res.status(404).json({ error: "Expense not found" });
            return;
        }
        res.status(200).json({ message: "Expense deleted successfully" });
        return;
    } catch (error) {
        res.status(500).json({ error: "Failed to delete expense", details: error });
        return;
    }
});

export default router;