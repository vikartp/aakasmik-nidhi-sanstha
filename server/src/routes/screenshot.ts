import { Router } from "express";
import { uploadScreenshot } from "../controllers/screenshot";
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post("/upload", upload.single("screenshot"), uploadScreenshot);

export default router;
