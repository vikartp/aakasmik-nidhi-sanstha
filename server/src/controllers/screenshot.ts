import { Request, Response } from "express";
import Screenshot from "../models/Screenshot";
import { cloudinary } from "../utils/cloudinary";

export const uploadScreenshot = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
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
                    userName: req.body.userName,
                    fatherName: req.body.fatherName,
                    type: req.body.type || "payment",
                    uploadMonth:
                        req.body.uploadMonth ||
                        new Date().toLocaleString("default", { month: "long" }),
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
        const publicId = screenshot.publicId ?? screenshot.url.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(`screenshots/${publicId}`, {
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

        if (screenshots.length === 0) {
            res.status(404).json({ error: "No screenshots found for this month" });
            return;
        }

        for (const screenshot of screenshots) {
            // Delete from Cloudinary
            const publicId = screenshot.publicId ?? screenshot.url.split("/").pop()?.split(".")[0];
            await cloudinary.uploader.destroy(`screenshots/${publicId}`, {
                resource_type: "image",
            });
        }

        const response = await Screenshot.deleteMany({ uploadMonth: month });
        res.status(200).json({ message: "Screenshots deleted successfully", count: response.deletedCount });
    } catch (err) {
        console.error("Error deleting screenshots by month:", err);
        res.status(500).json({ error: "Failed to delete screenshots" });
    }
}