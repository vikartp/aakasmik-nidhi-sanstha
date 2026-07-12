import { Router } from 'express';
import { forgotPassword, googleLogin, loginUser, logoutUser, registerUser } from '../controllers/auth';

const router = Router()

// Register
router.post('/register', registerUser)

// Login
router.post("/login", loginUser)

// Google Login
router.post("/google-login", googleLogin)

// Logout
router.post("/logout", logoutUser)

// Forgot Password
router.post("/forgot-password", forgotPassword)

export default router
