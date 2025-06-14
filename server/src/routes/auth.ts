import { Router, Request, Response } from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/auth';

const router = Router()

// Register
router.post('/register', registerUser)

// Login
router.post("/login", loginUser)

// Refresh Token
// router.get("/refresh-token", refreshToken)

// Logout
router.post("/logout", logoutUser)

export default router
