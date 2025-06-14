import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import User, { IUser } from "../models/User"
dotenv.config()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret"

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken as string | undefined;

    if (!token) {
        res.status(401).json({ message: "Access token missing" });
        return;
    }

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(err)
                if (typeof payload !== "object" || !payload?.id) {
                    return reject("Invalid token payload")
                }
                resolve(payload)
            })
        })

        // Check user existence
        const userObject = await User.findById((decoded as any).id)
        if (!userObject) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        req.user = userObject as IUser
        next()
    } catch (error) {
        res.status(401).json({ message: (error === "Invalid token payload") ? error : "Invalid or expired token" })
        return;
    }
}

export default authenticateToken