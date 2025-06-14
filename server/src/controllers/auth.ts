import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// 🔐 Generate tokens
const generateAccessToken = (user: IUser) =>
  jwt.sign({ id: user._id, mobile: user.mobile }, ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

// const generateRefreshToken = (user: IUser) =>
//   jwt.sign({ id: user._id, mobile: user.mobile }, REFRESH_TOKEN_SECRET, {
//     expiresIn: "7d",
//   });

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, fatherName, email, mobile, occupation, password, role } =
    req.body;
  try {
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      res.status(400).json({ message: "Mobile already registered." });
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: "Email Id already registered." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      fatherName,
      email,
      mobile,
      occupation,
      role,
      password: hashed,
    });
    res.status(201).json({ message: "Registered successfully", user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: `Registration failed, ${
          err instanceof Error ? err.message : "Unknown error"
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
    // const refreshToken = generateRefreshToken(user);
    // .cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "none",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // })

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ accessToken, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
};

// export const refreshToken = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const token = req.cookies.refreshToken;
//   if (!token) {
//     res.status(401).json({ message: "No refresh token" });
//     return;
//   }

//   try {
//     const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
//     const accessToken = generateAccessToken(payload as IUser);
//     res.json({ accessToken });
//   } catch (err) {
//     res.status(403).json({ message: "Invalid refresh token" });
//   }
// };

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  // res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
  res.json({ message: "Logged out" });
};
