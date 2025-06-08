import { Router } from "express";
import { getScreenshots, uploadScreenshot } from "../controllers/screenshot";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/", getScreenshots)
router.post("/upload", upload.single("screenshot"), uploadScreenshot);

export default router;
