import { Request, Response } from "express";
import Screenshot, { IScreenshot } from "../models/Screenshot";
import { cloudinary } from "../utils/cloudinary";
import { Document } from "mongoose";

export const uploadScreenshot = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.body.userId;
    const uploadMonth =
        req.body.uploadMonth ||
        new Date().toLocaleString("default", { month: "long" });
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxSize) {
            res.status(400).json({ message: "Image size must be less than 10MB. Please reduce the file size." });
            return;
        }
        // Check for existing screenshot for this user and month
        const existing = await Screenshot.findOne({ userId, uploadMonth, type: 'payment' });
        if (existing) {
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(getPublicIdForCloudinaryImage(existing), {
                resource_type: "image",
            });
            // Delete from MongoDB
            await Screenshot.deleteOne({ _id: existing._id });
        }

        const uploadResponse = cloudinary.uploader.upload_stream(
            { folder: "screenshots", secure: true, resource_type: "image" },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }
                const screenshot = new Screenshot({
                    url: result?.secure_url,
                    publicId: result?.public_id,
                    userId: req.body.userId,
                    type: req.body.type || "payment",
                    uploadMonth,
                });
                await screenshot.save();
                res.json({ url: result?.secure_url });
            }
        );

        uploadResponse.end((<Express.Multer.File>req.file).buffer); // Use the buffer from multer
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
};

export const rejectScreenshot = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { screenshotId, rejectionReason } = req.body;
    try {
        if (!screenshotId || !rejectionReason) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        // Find the screenshot
        const screenshot = await Screenshot.findById(screenshotId);
        if (!screenshot) {
            res.status(404).json({ error: "Screenshot not found" });
            return;
        }

        // Set rejection reason and verified status
        screenshot.rejected = rejectionReason;
        screenshot.verified = false; // Mark as not verified
        await screenshot.save();

        res.status(200).json({ message: "Screenshot rejected successfully" });
    } catch (err) {
        console.error("Error rejecting screenshot:", err);
        res.status(500).json({ error: "Failed to reject screenshot" });
    }
}

export const getScreenshotById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const screenshot = await Screenshot.findById(id);
        if (!screenshot) {
            res.status(404).json({ error: "Screenshot not found" });
            return;
        }
        res.status(200).json(screenshot);
    } catch (err) {
        console.error("Error fetching screenshot:", err);
        res.status(500).json({ error: "Failed to fetch screenshot" });
    }
};

export const getScreenshots = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const screenshots = await Screenshot.find();
        res.status(200).json(screenshots);
    } catch (err) {
        console.error("Error fetching screenshots:", err);
        res.status(500).json({ error: "Failed to fetch screenshots" });
    }
};

export const getScreenshotsByMonth = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { month } = req.params;
        const screenshots = await Screenshot.find({ uploadMonth: month, type: { $ne: 'qrCode' } });
        res.status(200).json(screenshots);
    } catch (err) {
        console.error("Error fetching screenshots by month:", err);
        res.status(500).json({ error: "Failed to fetch screenshots" });
    }
}

export const getScreenshotsByUserIdAndMonth = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId, month } = req.params;
        const screenshots = await Screenshot.find({ userId, uploadMonth: month, type: { $ne: 'qrCode' } });
        res.status(200).json(screenshots);
    } catch (err) {
        console.error("Error fetching screenshots by user and month:", err);
        res.status(500).json({ error: "Failed to fetch screenshots" });
    }
};

export const deleteScreenshot = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const screenshot = await Screenshot.findById(id);
        if (!screenshot) {
            res.status(404).json({ error: "Screenshot not found" });
            return;
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(getPublicIdForCloudinaryImage(screenshot), {
            resource_type: "image",
        });

        await Screenshot.findByIdAndDelete(id);
        res.status(200).json({ message: "Screenshot deleted successfully" });
    } catch (err) {
        console.error("Error deleting screenshot:", err);
        res.status(500).json({ error: "Failed to delete screenshot" });
    }
};

export const deleteScreenshotByMonth = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { month } = req.params;
        const screenshots = await Screenshot.find({ uploadMonth: month });

        // Filter out qrCode type screenshots
        const toDelete = screenshots.filter(s => s.type !== 'qrCode');

        if (toDelete.length === 0) {
            res.status(404).json({ error: "No screenshots found for this month (excluding qrCode)" });
            return;
        }

        // Delete from Cloudinary in parallel
        await Promise.all(
            toDelete.map(async (screenshot) => {
                await cloudinary.uploader.destroy(getPublicIdForCloudinaryImage(screenshot), {
                    resource_type: "image",
                });
            })
        );

        // Delete from MongoDB (excluding qrCode)
        const response = await Screenshot.deleteMany({ uploadMonth: month, type: { $ne: 'qrCode' } });
        res.status(200).json({ message: "Screenshots deleted successfully", count: response.deletedCount });
        return;
    } catch (err) {
        console.error("Error deleting screenshots by month:", err);
        res.status(500).json({ error: "Failed to delete screenshots" });
        return;
    }
};

function getPublicIdForCloudinaryImage(screenshot: Document<unknown, {}, IScreenshot, {}> & IScreenshot & Required<{ _id: unknown; }> & { __v: number; }) {
    return screenshot.publicId ?? `screenshots/${screenshot.url.split("/").pop()?.split(".")[0]}`;
}

