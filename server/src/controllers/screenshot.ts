import { Request, Response } from 'express';
import Screenshot from '../models/Screenshot';
import { cloudinary } from '../utils/cloudinary';

export const uploadScreenshot = async (req: Request, res: Response): Promise<void> => {
    try {
        const uploadResponse = cloudinary.uploader.upload_stream(
            { folder: "screenshots" },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }
                const screenshot = new Screenshot({ url: result?.secure_url, userId: req.body.userId, userName: req.body.userName });
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

export const getScreenshots = async (req: Request, res: Response): Promise<void> => {
    try {
        const screenshots = await Screenshot.find();
        res.status(200).json(screenshots);
    } catch (err) {
        console.error("Error fetching screenshots:", err);
        res.status(500).json({ error: "Failed to fetch screenshots" });
    }
};