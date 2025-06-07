import { Router } from 'express';
// import multer from 'multer';
const multer = require('multer');
import { uploadScreenshot } from '../controllers/screenshot';
import { storage } from '../utils/cloudinary';

const upload = multer({ storage });
const router = Router();

router.post('/upload', upload.single('image'), uploadScreenshot);

export default router;