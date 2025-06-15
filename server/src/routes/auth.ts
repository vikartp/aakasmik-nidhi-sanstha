import { Router, Request, Response } from 'express';
import { forgotPassword, loginUser, logoutUser, registerUser } from '../controllers/auth';

const router = Router()

// Register
router.post('/register', registerUser)

// Login
router.post("/login", loginUser)

// Logout
router.post("/logout", logoutUser)

// Forgot Password
router.post("/forgot-password", forgotPassword)

export default router
