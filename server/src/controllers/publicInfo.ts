import { Request, Response } from "express";
import User from "../models/User";
import Screenshot from "../models/Screenshot";

export const getPublicUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({ verified: true }, "name fatherName createdAt");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
}

export const getQrCode = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const screenshot = await Screenshot.findOne({
            type: "qrCode",
        });

        if (!screenshot) {
            res.status(404).json({ error: "QR Code screenshot not found" });
            return;
        }

        res.status(200).json(screenshot);
    } catch (err) {
        console.error("Error fetching QR Code screenshot:", err);
        res.status(500).json({ error: "Failed to fetch QR Code screenshot" });
    }
}