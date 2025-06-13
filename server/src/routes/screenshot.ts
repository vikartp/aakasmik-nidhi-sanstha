import { Router } from "express";
import { getQrCode, getScreenshots, uploadScreenshot } from "../controllers/screenshot";
import multer from "multer";
import authenticateToken from "../middleware/authMiddleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", authenticateToken, getScreenshots);
router.get('/qrCode', getQrCode);
router.post("/upload", authenticateToken, upload.single("screenshot"), uploadScreenshot);

export default router;
