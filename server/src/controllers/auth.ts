import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import User from "../models/User"

const JWT_SECRET = process.env.JWT_SECRET || "mysecret"

export const registerUser = async (req: Request, res: Response) : Promise<void> => {
  const { name, fatherName, email, mobile, occupation, password, role } = req.body
  try {
    const existing = await User.findOne({ mobile })
    if (existing) {
        res.status(400).json({ message: "Mobile already registered." })
        return;
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, fatherName, email, mobile, occupation, role, password: hashed })
    res.status(201).json({ message: "Registered successfully", user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Registration failed" })
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { mobile, password } = req.body
  try {
    const user = await User.findOne({ mobile })
    if (!user) {
        res.status(401).json({ message: "Invalid mobile number" })
        return;
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
        res.status(401).json({ message: "Invalid password" })
        return;
    }

    const accessToken  = jwt.sign({ id: user._id, mobile: user.mobile }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ accessToken, user })
  } catch (err) {
    res.status(500).json({ message: "Login error" })
  }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // On the client side, simply discard the JWT (e.g., remove it from local storage).
    // Server-side invalidation typically involves maintaining a token blacklist,
    // which is beyond the scope here.
    // TODO: Implement refresh token logic if needed and keep the expiry less than 7 days.
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout error" });
  }
}