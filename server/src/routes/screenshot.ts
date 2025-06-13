import { Router } from "express";
import { deleteScreenshot, getQrCode, getScreenshots, uploadScreenshot, deleteScreenshotByMonth } from "../controllers/screenshot";
import multer from "multer";
import authenticateToken from "../middleware/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", authenticateToken, getScreenshots);
router.get('/qrCode', getQrCode);
router.post("/upload", authenticateToken, upload.single("screenshot"), uploadScreenshot);
router.delete("/:id", deleteScreenshot);
router.delete("/month/:month", authenticateToken, deleteScreenshotByMonth);

export default router;
