const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/video.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp4', '.webm', '.mov'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only video files are allowed'));
  },
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch { /* no-op */ }
  }
  next();
};

const router = Router();

router.post('/', authMiddleware, upload.single('video'), videoController.createVideo);
router.get('/saved', authMiddleware, videoController.getBookmarks);
router.get('/', optionalAuth, videoController.getAllVideos);
router.get('/:id', optionalAuth, videoController.getVideoById);
router.post('/:id/like', authMiddleware, videoController.likeVideo);
router.post('/:id/comment', authMiddleware, videoController.addComment);
router.get('/:id/comments', videoController.getComments);
router.post('/:id/bookmark', authMiddleware, videoController.bookmarkVideo);

module.exports = router;
