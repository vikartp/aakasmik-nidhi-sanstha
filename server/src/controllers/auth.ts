import { CookieOptions, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User, { IUser } from "../models/User";
import UserSecret from "../models/Secret";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// 🔐 Generate tokens
const generateAccessToken = (user: IUser) =>
    jwt.sign({ id: user._id, mobile: user.mobile }, ACCESS_TOKEN_SECRET, {
        expiresIn: "7y",
    });

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name, fatherName, email, mobile, occupation, password, role, secretKey } =
        req.body;
    try {
        const existingMobile = await User.findOne({ mobile });
        if (existingMobile) {
            res.status(400).json({ message: "Mobile already registered." });
            return;
        }

        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            res.status(400).json({ message: "Invalid mobile number. Must be 10 digits starting with 6-9." });
            return;
        }

        if (email?.length && await User.findOne({ email })) {
            res.status(400).json({ message: "Email Id already registered." });
            return;
        }

        if (password.length < 4) {
            res.status(400).json({ message: "Password must be at least 4 characters long." });
            return;
        }

        /**
         * Note: Commenting out the secret key validation for now.
         * Uncomment this section if you want to enforce secret key validation.
         */
        // const mobileSecret = await UserSecret.findOne({ mobile });
        // if (!mobileSecret || mobileSecret.secret !== secretKey) {
        //     res.status(403).json({ message: "Invalid secret key. Please contact your admin to get secret key for your mobile number." });
        //     return;
        // }

        const hashed = await bcrypt.hash(password, 10);
        const userData: any = {
            name,
            fatherName,
            mobile,
            occupation,
            role,
            password: hashed,
        };
        // Only include email if it's a non-empty string
        if (typeof email === 'string' && email.trim().length > 0) {
            userData.email = email.trim();
        }
        const user = await User.create(userData);
        res.status(201).json({ message: "Registered successfully", user });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({
                message: `Registration failed, ${err instanceof Error ? err.message : "Unknown error"
                    }`,
            });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { mobile, password } = req.body;
    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            res.status(401).json({ message: "Invalid mobile number" });
            return;
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }

        if (!user.verified) {
            res
                .status(403)
                .json({
                    message: "Please wait or contact admin to verify your account",
                });
            return;
        }
        const accessToken = generateAccessToken(user);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years (matches JWT expiration)
        })
            .json({ message: "Login successful", accessToken });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
};

export const logoutUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    res.cookie('accessToken', '', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0)
    });
    res.clearCookie("accessToken");
    res.json({ message: "Logged out" });
};


export const forgotPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { mobile, secretKey, newPassword } = req.body;
    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            res.status(404).json({ message: "Mobile number is not registered." });
            return;
        }
        if (newPassword.length < 4) {
            res.status(400).json({ message: "Password must be at least 4 characters long." });
            return;
        }
        // Validate secret key
        const mobileSecret = await UserSecret.findOne({ mobile });
        if (!mobileSecret || mobileSecret.secret !== secretKey) {
            res.status(403).json({ message: "Invalid secret key. Please contact your admin to get secret key for your mobile number." });
            return;
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: `Password reset failed, ${err instanceof Error ? err.message : "Unknown error"
                }`,
        });
    }
}

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;

    if (!credential) {
        res.status(400).json({ message: "Google credential is required" });
        return;
    }

    if (!GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID is not configured");
        res.status(500).json({ message: "Google login is not configured on the server" });
        return;
    }

    try {
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(401).json({ message: "Invalid Google token" });
            return;
        }

        const email = payload.email;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: "No account found with this email. Please register or login first using mobile number & password, update your email in your profile, or contact admin.",
            });
            return;
        }

        if (!user.verified) {
            res.status(403).json({
                message: "Please wait or contact admin to verify your account",
            });
            return;
        }

        // Issue the same JWT as the regular login
        const accessToken = generateAccessToken(user);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years (matches JWT expiration)
        })
            .json({ message: "Login successful", accessToken });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(401).json({ message: "Google authentication failed. Please try again." });
    }
};
