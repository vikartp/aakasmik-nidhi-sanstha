import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import dotenv from "dotenv"
import User, { IUser } from "../models/User"
dotenv.config()

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret"

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token missing" })
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
      return res.status(401).json({ message: "User not found" })
    }

    req.user = userObject as IUser
    next()
  } catch (error) {
    return res.status(401).json({ message: (error === "Invalid token payload") ? error : "Invalid or expired token" })
  }
}

export default authenticateToken