const pool = require('../config/database');

const createVideo = async ({ title, description, category, file_path }) => {
  const { rows } = await pool.query(
    `INSERT INTO videos (title, description, category, file_path)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, category, file_path]
  );
  return rows[0];
};

const getAllVideos = async (userId = null) => {
  const { rows } = await pool.query(
    `SELECT
       v.*,
       (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count,
       ($1::uuid IS NOT NULL AND EXISTS(
         SELECT 1 FROM likes l WHERE l.video_id = v.id AND l.user_id = $1
       )) AS liked,
       ($1::uuid IS NOT NULL AND EXISTS(
         SELECT 1 FROM bookmarks b WHERE b.video_id = v.id AND b.user_id = $1
       )) AS bookmarked
     FROM videos v
     ORDER BY v.created_at DESC`,
    [userId]
  );
  return rows;
};

const getVideoById = async (id) => {
  const { rows } = await pool.query(
    `SELECT v.*,
       (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count
     FROM videos v WHERE v.id = $1`,
    [id]
  );
  if (!rows[0]) {
    const err = new Error('Video not found'); err.status = 404; throw err;
  }
  return rows[0];
};

const toggleLike = async (userId, videoId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT 1 FROM likes WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    let liked;
    if (rows.length > 0) {
      await client.query(
        'DELETE FROM likes WHERE user_id = $1 AND video_id = $2',
        [userId, videoId]
      );
      await client.query(
        'UPDATE videos SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
        [videoId]
      );
      liked = false;
    } else {
      await client.query(
        'INSERT INTO likes (user_id, video_id) VALUES ($1, $2)',
        [userId, videoId]
      );
      await client.query(
        'UPDATE videos SET like_count = like_count + 1 WHERE id = $1',
        [videoId]
      );
      liked = true;
    }

    const { rows: videoRows } = await client.query(
      'SELECT like_count FROM videos WHERE id = $1',
      [videoId]
    );
    await client.query('COMMIT');
    return { liked, like_count: videoRows[0].like_count };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const addComment = async (userId, videoId, content) => {
  const { rows } = await pool.query(
    `INSERT INTO comments (user_id, video_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, content, created_at`,
    [userId, videoId, content.trim()]
  );
  // Fetch with username
  const { rows: full } = await pool.query(
    `SELECT c.id, c.content, c.created_at, u.username
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.id = $1`,
    [rows[0].id]
  );
  return full[0];
};

const getComments = async (videoId) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.content, c.created_at, u.username
     FROM comments c JOIN users u ON u.id = c.user_id
     WHERE c.video_id = $1
     ORDER BY c.created_at DESC`,
    [videoId]
  );
  return rows;
};

const toggleBookmark = async (userId, videoId) => {
  const { rows } = await pool.query(
    'SELECT 1 FROM bookmarks WHERE user_id = $1 AND video_id = $2',
    [userId, videoId]
  );

  if (rows.length > 0) {
    await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );
    return { bookmarked: false };
  } else {
    await pool.query(
      'INSERT INTO bookmarks (user_id, video_id) VALUES ($1, $2)',
      [userId, videoId]
    );
    return { bookmarked: true };
  }
};

const getUserVideoStatus = async (userId, videoId) => {
  const [likeRes, bookmarkRes] = await Promise.all([
    pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND video_id = $2', [userId, videoId]),
    pool.query('SELECT 1 FROM bookmarks WHERE user_id = $1 AND video_id = $2', [userId, videoId]),
  ]);
  return {
    liked: likeRes.rows.length > 0,
    bookmarked: bookmarkRes.rows.length > 0,
  };
};

const getBookmarkedVideos = async (userId) => {
  const { rows } = await pool.query(
    `SELECT v.*,
       (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count,
       true AS bookmarked,
       EXISTS(SELECT 1 FROM likes l WHERE l.video_id = v.id AND l.user_id = $1) AS liked
     FROM videos v
     INNER JOIN bookmarks b ON b.video_id = v.id AND b.user_id = $1
     ORDER BY v.created_at DESC`,
    [userId]
  );
  return rows;
};

module.exports = {
  createVideo, getAllVideos, getVideoById,
  toggleLike, addComment, getComments, toggleBookmark, getUserVideoStatus,
  getBookmarkedVideos,
};
