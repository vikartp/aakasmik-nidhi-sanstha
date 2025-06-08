import { Router, Request, Response } from 'express';
import { loginUser, registerUser } from '../controllers/auth';

const router = Router()

// Register
router.post('/register', registerUser)

// Login
router.post("/login", loginUser)

export default router
