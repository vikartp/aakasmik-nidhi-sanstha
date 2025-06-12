import { Router } from "express";
import { getQrCode, getScreenshots, uploadScreenshot } from "../controllers/screenshot";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getScreenshots);
router.get('/qrCode', getQrCode);
router.post("/upload", upload.single("screenshot"), uploadScreenshot);

export default router;
