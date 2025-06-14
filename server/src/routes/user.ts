import { Router } from "express";
import { deleteUser, getLoggedInUser, getSecretByMobile, getUserById, getUsers, makeAdmin, verifyMember } from "../controllers/user";
import authenticateToken from "../middleware/authMiddleware";

const router = Router();

router.get("/", getUsers);

router.get("/me", authenticateToken, getLoggedInUser);

router.get("/:userId", authenticateToken, getUserById);

router.delete("/:userId", authenticateToken, deleteUser);

router.put("/make-admin/:userId", authenticateToken, makeAdmin);

router.put("/verify-member/:userId", authenticateToken, verifyMember);

router.get("/secret/:mobile", authenticateToken, getSecretByMobile);

export default router;
