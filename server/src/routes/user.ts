import { Router } from "express";
import { deleteUser, getUserById, getUsers, makeAdmin, verifyMember } from "../controllers/user";
import authenticateToken from "../middleware/authMiddleware";

const router = Router();

router.get("/", getUsers);

router.get("/:userId", getUserById);

router.delete("/:userId", authenticateToken, deleteUser);

router.put("/make-admin/:userId", authenticateToken, makeAdmin);

router.put("/verify-member/:userId", authenticateToken, verifyMember);

export default router;
