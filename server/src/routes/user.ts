import { Router } from "express";
import { deleteUser, getLoggedInUser, getSecretByMobile, getUserById, getUsers, makeAdmin, verifyMember } from "../controllers/user";

const router = Router();

router.get("/", getUsers);

router.get("/me", getLoggedInUser);

router.get("/:userId", getUserById);

router.delete("/:userId", deleteUser);

router.put("/make-admin/:userId", makeAdmin);

router.put("/verify-member/:userId", verifyMember);

router.get("/secret/:mobile", getSecretByMobile);

export default router;
