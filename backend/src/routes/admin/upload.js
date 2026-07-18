import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { authRequired, adminRequired } from '../../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendUploadsDir = path.join(__dirname, '../../../uploads/products');

// On cPanel, static site is served from public_html — store images there too
const publicUploadsDir = process.env.PUBLIC_UPLOADS_DIR
  || (fs.existsSync('/home/dyntra/public_html')
    ? '/home/dyntra/public_html/uploads/products'
    : null);

const uploadsDir = publicUploadsDir || backendUploadsDir;

for (const dir of [backendUploadsDir, publicUploadsDir].filter(Boolean)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'));
    }
  },
});

function mirrorToBackend(filename) {
  if (!publicUploadsDir || publicUploadsDir === backendUploadsDir) return;
  try {
    const src = path.join(publicUploadsDir, filename);
    const dest = path.join(backendUploadsDir, filename);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
  } catch {
    // non-fatal
  }
}

router.post('/product-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
  mirrorToBackend(req.file.filename);
  res.json({ url: `/uploads/products/${req.file.filename}` });
});

router.post('/product-images', upload.array('images', 8), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'At least one image file is required' });
  }
  req.files.forEach((f) => mirrorToBackend(f.filename));
  res.json({
    urls: req.files.map((f) => `/uploads/products/${f.filename}`),
  });
});

router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image must be under 5 MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});

export default router;
