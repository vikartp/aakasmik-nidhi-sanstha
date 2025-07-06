import { Router } from "express";
import { deleteScreenshot, getScreenshotById, getScreenshots, getScreenshotsByMonth, uploadScreenshot, deleteScreenshotByMonth, getScreenshotsByUserIdAndMonth, rejectScreenshot } from "../controllers/screenshot";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getScreenshots);
router.get("/:id", getScreenshotById);
router.get("/month/:month", getScreenshotsByMonth);
router.get("/user/:userId/month/:month", getScreenshotsByUserIdAndMonth);
router.post("/upload", upload.single("screenshot"), uploadScreenshot);
router.post("/reject", rejectScreenshot);
router.delete("/:id", deleteScreenshot);
router.delete("/month/:month", deleteScreenshotByMonth);

export default router;
