import { Router } from "express";
import { deleteScreenshot, getScreenshotById, getScreenshots, getScreenshotsByMonth, uploadScreenshot, deleteScreenshotByMonth, getScreenshotsByUserIdAndMonth } from "../controllers/screenshot";
import multer from "multer";
import authenticateToken from "../middleware/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", authenticateToken, getScreenshots);
router.get("/:id", authenticateToken, getScreenshotById);
router.get("/month/:month", authenticateToken, getScreenshotsByMonth);
router.get("/user/:userId/month/:month", authenticateToken, getScreenshotsByUserIdAndMonth);
router.post("/upload", authenticateToken, upload.single("screenshot"), uploadScreenshot);
router.delete("/:id", deleteScreenshot);
router.delete("/month/:month", authenticateToken, deleteScreenshotByMonth);

export default router;
