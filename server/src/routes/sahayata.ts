import { Router } from "express";
import sahayataModel from "../models/Sahayata";
import { Request, Response } from "express";

const router = Router();

// Create a new sahayata record
router.post("/", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            res.status(403).json({ error: "Forbidden: Only admins can create sahayata records" });
            return;
        }
        const { memberId, memberName, amount, givenDate, description, repaymentDate } = req.body;
        // Validate input
        if (!memberId || !memberName || !amount || typeof amount !== 'number' || !givenDate) {
            res.status(400).json({ error: "Invalid input data. memberId, memberName, amount, and givenDate are required." });
            return;
        }
        const updatedBy = req.user?.name || "unknown";
        const newSahayata = await sahayataModel.create({
            memberId,
            memberName,
            amount,
            givenDate: new Date(givenDate),
            description: description || "",
            repaymentDate: repaymentDate ? new Date(repaymentDate) : undefined,
            repaidAmount: 0,
            status: 'pending',
            updatedBy,
        });
        res.status(201).json(newSahayata);
    } catch (error) {
        res.status(500).json({ error: "Failed to create sahayata record", details: error });
    }
});

// Get all sahayata records
router.get("/", async (req: Request, res: Response) => {
    try {
        const sahayataRecords = await sahayataModel.find().sort({ givenDate: -1 });
        res.status(200).json(sahayataRecords);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sahayata records", details: error });
    }
});

// Update a sahayata record by ID
router.put("/:id", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            res.status(403).json({ error: "Forbidden: Only admins can update sahayata records" });
            return;
        }
        const { id } = req.params;
        const { memberId, memberName, amount, givenDate, description, repaymentDate, repaidAmount, status } = req.body;
        const updatedBy = req.user?.name || "unknown";

        const updateData: Record<string, unknown> = { updatedBy };
        if (memberId) updateData.memberId = memberId;
        if (memberName) updateData.memberName = memberName;
        if (amount !== undefined) updateData.amount = amount;
        if (givenDate) updateData.givenDate = new Date(givenDate);
        if (description !== undefined) updateData.description = description;
        if (repaymentDate) updateData.repaymentDate = new Date(repaymentDate);
        if (repaidAmount !== undefined) updateData.repaidAmount = repaidAmount;
        if (status) updateData.status = status;

        const updatedSahayata = await sahayataModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedSahayata) {
            res.status(404).json({ error: "Sahayata record not found" });
            return;
        }
        res.status(200).json(updatedSahayata);
        return;
    } catch (error) {
        res.status(500).json({ error: "Failed to update sahayata record", details: error });
        return;
    }
});

// Delete a sahayata record by ID
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            res.status(403).json({ error: "Forbidden: Only admins can delete sahayata records" });
            return;
        }
        const { id } = req.params;
        const deletedSahayata = await sahayataModel.findByIdAndDelete(id);
        if (!deletedSahayata) {
            res.status(404).json({ error: "Sahayata record not found" });
            return;
        }
        res.status(200).json({ message: "Sahayata record deleted successfully" });
        return;
    } catch (error) {
        res.status(500).json({ error: "Failed to delete sahayata record", details: error });
        return;
    }
});

export default router;
