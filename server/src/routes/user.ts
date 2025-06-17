import { Router } from "express";
import { deleteUser, getLoggedInUser, getSecretByMobile, getUserById, getUsers, makeAdmin, updateMembershipDate, uploadProfileImage, verifyMember } from "../controllers/user";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getUsers);

router.get("/me", getLoggedInUser);

router.get("/:userId", getUserById);

router.get("/secret/:mobile", getSecretByMobile);

router.put("/make-admin/:userId", makeAdmin);

router.put("/verify-member/:userId", verifyMember);

router.put("/membership/:userId", updateMembershipDate);

router.post("/upload-profile", upload.single("profile"), uploadProfileImage);

router.delete("/:userId", deleteUser);

export default router;
