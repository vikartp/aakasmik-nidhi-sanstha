import { Request, Response } from "express";
import User from "../models/User";
import UserSecret from "../models/Secret";
import { deleteUserScreenshots } from "../utils/screenshots";
import { omit } from "lodash";
import { generateRandomString } from "../utils/user";
import { cloudinary } from "../utils/cloudinary";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const getLoggedInUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const user = await User.findById(req.user._id, "-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const getUserById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId, "-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const deleteUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.params.userId;
    try {
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ error: 'Forbidden: Only super admin can delete users.' });
            return;
        };
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        await deleteUserScreenshots(userId);
        if (user.profileUrl) {
            // If it exists, delete the old image from Cloudinary
            const publicId = user.profileUrl.split("/").pop()?.split(".")[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`profile/${publicId}`, {
                    resource_type: "image",
                });
            }
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const makeAdmin = async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.userId;
    try {
        if (req.user?.role !== 'superadmin') {
            res.status(403).json({ error: 'Forbidden: Only super admin can make admin.' });
            return;
        };
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.role = "admin";
        user.verified = true; // Automatically verify when making admin
        await user.save();
        res
            .status(200)
            .json({
                message: "User role updated to admin",
                user: omit(user, ["password"]),
            });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const verifyMember = async (
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.params.userId;
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Only admin can verify member.' });
            return;
        };
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.verified = true;
        await user.save();
        res.status(200).json({ message: "User verified successfully", user });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

export const getSecretByMobile = async (
    req: Request,
    res: Response
): Promise<void> => {
    const mobile = req.params.mobile;
    try {
        if (mobile.length !== 10) {
            res.status(400).json({ message: "Invalid mobile number format. It should be 10 digits long." });
            return;
        }
        // This endpoint can be used by admins or superadmins to retrieve secrets for any user
        if (req.user && req.user.role !== "admin" && req.user.role !== "superadmin") {
            res.status(403).json({ message: "Forbidden: Only admins can access user secrets" });
            return;
        }
        // If user with this mobile number verified, restrict access to secret key
        const mobileUser = await User.findOne({ mobile });
        if (mobileUser && mobileUser.verified && req?.user?.role === "admin") {
            res.status(403).json({
                message: `Forbidden: User is already verified. Users can get/reset thier secret key by themselves.
                 Ask him/her to contact creator of the portal if he/she has forgotten password and secret key both.` });
            return;
        }
        const secretKey = await UserSecret.findOne({ mobile });
        if (!secretKey) {
            const newSecret = generateRandomString();
            const createdSecret = await UserSecret.create({
                mobile,
                secret: newSecret,
                createdAt: new Date(),
                createdBy: req.user?._id || "system",
            });
            res
                .status(200)
                .json({
                    message: "Secret retrieved successfully",
                    secret: createdSecret.secret,
                });
        } else {
            res
                .status(200)
                .json({
                    message: "Secret retrieved successfully",
                    secret: secretKey.secret,
                });
        }
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
        return;
    }
};

// Reset secret key for a user
export const resetSecretKey = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    try {
        const userSecretObj = await UserSecret.findOne({ mobile: req.user.mobile });
        const newSecret = generateRandomString();
        if (!userSecretObj) {
            // If no secret exists, create a new one
            await UserSecret.create({
                mobile: req.user.mobile,
                secret: newSecret,
                createdAt: new Date(),
                createdBy: req.user._id,
            });
        } else {
            // If a secret exists, update it
            userSecretObj.secret = newSecret;
            userSecretObj.createdAt = new Date();
            userSecretObj.createdBy = req.user._id as string;
            await userSecretObj.save();
        }
        res.status(200).json({
            message: "Secret key reset successfully",
            secret: newSecret,
        });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
        return;
    }
}

export const getMySecretKey = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    try {
        const userSecretObj = await UserSecret.findOne({ mobile: req.user.mobile });
        if (!userSecretObj) {
            res.status(404).json({ message: "Secret key not found." });
            return;
        }
        res.status(200).json({
            message: "Secret key retrieved successfully",
            secret: userSecretObj.secret,
        });
    }
    catch (error) {
        res.status(500).json({ error: (error as Error).message });
        return;
    }
};

// create a method to upload profile image
export const uploadProfileImage = async (
    req: Request,
    res: Response
): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({ message: "Only image files (jpg, jpeg, png, gif, webp) are allowed." });
        return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        res.status(400).json({ message: "Image size must be less than 10MB. Please reduce the file size." });
        return;
    }
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Check if the profileUrl already exists
        if (user.profileUrl) {
            // If it exists, delete the old image from Cloudinary
            const publicId = user.profileUrl.split("/").pop()?.split(".")[0];
            if (publicId) {
                await cloudinary.uploader.destroy(`profile/${publicId}`, {
                    resource_type: "image",
                });
            }
        }
        // Upload the file to your storage ( Cloudinary)
        const uploadResponse = cloudinary.uploader.upload_stream(
            {
                folder: "profile",
                secure: true,
                resource_type: "image",
                transformation: [
                    { width: 256, height: 256, gravity: "face", crop: "thumb", radius: "max", quality: "auto:eco", fetch_format: "auto" }
                ]
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }
                try {
                    user.profileUrl = result?.secure_url;
                    await user.save();
                    res
                        .status(200)
                        .json({
                            message: "Profile image uploaded successfully",
                            user: omit(user.toObject(), ["password"]),
                        });
                } catch (dbError) {
                    res.status(500).json({ error: "Failed to save user with new profile image" });
                }
            }
        );

        uploadResponse.end((<Express.Multer.File>req.file).buffer);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

// Update membership date for a user
export const updateMembershipDate = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
            res.status(403).json({ message: "Forbidden: Only admins can update membership dates" });
            return;
        }

        const userId = req.params.userId;
        const { membershipDate } = req.body;

        if (!membershipDate) {
            res.status(400).json({ message: "Membership date is required" });
            return;
        }

        const inputDate = new Date(membershipDate);
        if (isNaN(inputDate.getTime())) {
            res.status(400).json({ message: "Invalid date format" });
            return;
        }
        if (inputDate > new Date()) {
            res.status(400).json({ message: "Membership date cannot be in the future" });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { membershipDate: inputDate },
            { new: true }
        );
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ message: "Membership date updated successfully", user });
        return;
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};

// Update user info (name, fatherName, email, occupation) for logged-in user
export const updateUserInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { name, fatherName, email, occupation } = req.body;
        if (name !== undefined) user.name = name;
        if (fatherName !== undefined) user.fatherName = fatherName;
        if (email !== undefined) user.email = email;
        if (occupation !== undefined) user.occupation = occupation;
        if (name === undefined && fatherName === undefined && email === undefined && occupation === undefined) {
            res.status(400).json({ message: "No valid fields to update" });
            return;
        }
        await user.save();
        res.status(200).json({ message: "User info updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
};