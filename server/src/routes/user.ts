import { Router } from "express";
import { deleteUser, getLoggedInUser, getSecretByMobile, getUserById, getUsers, makeAdmin, uploadProfileImage, verifyMember } from "../controllers/user";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getUsers);

router.get("/me", getLoggedInUser);

router.get("/:userId", getUserById);

router.delete("/:userId", deleteUser);

router.put("/make-admin/:userId", makeAdmin);

router.put("/verify-member/:userId", verifyMember);

router.get("/secret/:mobile", getSecretByMobile);

router.post("/upload-profile", upload.single("profile"), uploadProfileImage);

export default router;
