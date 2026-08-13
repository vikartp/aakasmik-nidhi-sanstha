import { Router } from "express";
import sahayataModel from "../models/Sahayata";
import { Request, Response } from "express";
import multer from "multer";
import { cloudinary } from "../utils/cloudinary";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

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

// Upload/replace proof (PDF or image) for a sahayata record
router.post("/:id/proof", upload.single("proof"), async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            res.status(403).json({ error: "Forbidden: Only admins can upload proof" });
            return;
        }

        const { id } = req.params;
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        // Validate file type
        const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            res.status(400).json({ error: "Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed." });
            return;
        }

        const sahayata = await sahayataModel.findById(id);
        if (!sahayata) {
            res.status(404).json({ error: "Sahayata record not found" });
            return;
        }

        // If there's an existing proof, delete it from Cloudinary
        if (sahayata.proofPublicId) {
            try {
                const resourceType = sahayata.proofType === 'pdf' ? 'raw' : 'image';
                await cloudinary.uploader.destroy(sahayata.proofPublicId, {
                    resource_type: resourceType,
                    invalidate: true,
                });
            } catch (deleteError) {
                console.error("Error deleting old proof from Cloudinary:", deleteError);
                // Continue with upload even if delete fails
            }
        }

        const isPdf = req.file.mimetype === 'application/pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        const proofType = isPdf ? 'pdf' : 'image';

        // Upload to Cloudinary
        const uploadPromise = new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "sahayata-proofs",
                    resource_type: resourceType,
                    secure: true,
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(error || new Error("Upload failed"));
                    }
                    resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            );
            uploadStream.end(req.file!.buffer);
        });

        const uploadResult = await uploadPromise;

        // Update the sahayata record
        sahayata.proofUrl = uploadResult.secure_url;
        sahayata.proofPublicId = uploadResult.public_id;
        sahayata.proofType = proofType;
        await sahayata.save();

        res.status(200).json(sahayata);
    } catch (error) {
        console.error("Error uploading proof:", error);
        res.status(500).json({ error: "Failed to upload proof", details: error });
    }
});

// Delete proof for a sahayata record
router.delete("/:id/proof", async (req: Request, res: Response) => {
    try {
        // Validate role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            res.status(403).json({ error: "Forbidden: Only admins can delete proof" });
            return;
        }

        const { id } = req.params;
        const sahayata = await sahayataModel.findById(id);
        if (!sahayata) {
            res.status(404).json({ error: "Sahayata record not found" });
            return;
        }

        if (!sahayata.proofPublicId) {
            res.status(400).json({ error: "No proof to delete" });
            return;
        }

        // Delete from Cloudinary
        const resourceType = sahayata.proofType === 'pdf' ? 'raw' : 'image';
        await cloudinary.uploader.destroy(sahayata.proofPublicId, {
            resource_type: resourceType,
            invalidate: true,
        });

        // Clear proof fields
        sahayata.proofUrl = undefined;
        sahayata.proofPublicId = undefined;
        sahayata.proofType = undefined;
        await sahayata.save();

        res.status(200).json(sahayata);
    } catch (error) {
        console.error("Error deleting proof:", error);
        res.status(500).json({ error: "Failed to delete proof", details: error });
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
        const sahayata = await sahayataModel.findById(id);
        if (!sahayata) {
            res.status(404).json({ error: "Sahayata record not found" });
            return;
        }

        // Clean up proof from Cloudinary if it exists
        if (sahayata.proofPublicId) {
            try {
                const resourceType = sahayata.proofType === 'pdf' ? 'raw' : 'image';
                await cloudinary.uploader.destroy(sahayata.proofPublicId, {
                    resource_type: resourceType,
                    invalidate: true,
                });
            } catch (deleteError) {
                console.error("Error deleting proof from Cloudinary during record deletion:", deleteError);
            }
        }

        await sahayataModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Sahayata record deleted successfully" });
        return;
    } catch (error) {
        res.status(500).json({ error: "Failed to delete sahayata record", details: error });
        return;
    }
});

export default router;

