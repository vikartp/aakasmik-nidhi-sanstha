import { Router } from "express";
import { deleteUser, getUserById, getUsers } from "../controllers/user";

const router = Router();

router.get("/", getUsers);

router.get("/:userId", getUserById);

router.delete("/:userId", deleteUser);

export default router;
