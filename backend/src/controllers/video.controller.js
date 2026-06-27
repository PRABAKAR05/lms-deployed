const videoService = require('../services/video.service');
const { validateComment } = require('../utils/validators');

const createVideo = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    const file_path = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.file_path;
    if (!file_path) {
      return res.status(400).json({ error: 'Video file or file_path is required' });
    }
    const video = await videoService.createVideo({ title, description, category, file_path });
    res.status(201).json({ video });
  } catch (err) {
    next(err);
  }
};

const getAllVideos = async (req, res, next) => {
  try {
    const userId = req.user?.id ?? null;
    const videos = await videoService.getAllVideos(userId);
    res.json({ videos });
  } catch (err) {
    next(err);
  }
};

const getVideoById = async (req, res, next) => {
  try {
    const video = await videoService.getVideoById(req.params.id);
    let status = { liked: false, bookmarked: false };
    if (req.user) {
      status = await videoService.getUserVideoStatus(req.user.id, video.id);
    }
    res.json({ video: { ...video, ...status } });
  } catch (err) {
    next(err);
  }
};

const likeVideo = async (req, res, next) => {
  try {
    const result = await videoService.toggleLike(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const error = validateComment(req.body);
    if (error) return res.status(400).json({ error });

    const comment = await videoService.addComment(req.user.id, req.params.id, req.body.content);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await videoService.getComments(req.params.id);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

const bookmarkVideo = async (req, res, next) => {
  try {
    const result = await videoService.toggleBookmark(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const videos = await videoService.getBookmarkedVideos(req.user.id);
    res.json({ videos });
  } catch (err) {
    next(err);
  }
};

module.exports = { createVideo, getAllVideos, getVideoById, likeVideo, addComment, getComments, bookmarkVideo, getBookmarks };
