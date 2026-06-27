require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/database');

const storageBaseUrl = (process.env.SUPABASE_STORAGE_BASE_URL || '').replace(/\/$/, '');

const videoUrl = (fileName, envKey) => {
  if (process.env[envKey]) return process.env[envKey];
  if (storageBaseUrl) return `${storageBaseUrl}/${fileName}`;
  return `/uploads/${fileName}`;
};

const videos = [
  {
    title: 'Introduction to German',
    description: 'A quick introduction to the German language — greetings, alphabet, and basic phrases.',
    category: 'Language Learning',
    file_path: videoUrl('Introduction_German.mp4', 'INTRODUCTION_GERMAN_VIDEO_URL'),
  },
  {
    title: 'Learning German Vocabulary',
    description: 'Expand your German vocabulary with common everyday words and useful expressions.',
    category: 'Language Learning',
    file_path: videoUrl('Learning_German.mp4', 'LEARNING_GERMAN_VIDEO_URL'),
  },
  {
    title: 'German Story Time',
    description: 'Listen to a simple German story to improve comprehension and pronunciation.',
    category: 'Language Learning',
    file_path: videoUrl('Story_German.mp4', 'STORY_GERMAN_VIDEO_URL'),
  },
];

async function seed() {
  try {
    for (const v of videos) {
      const result = await pool.query(
        `UPDATE videos
         SET description = $2, category = $3, file_path = $4
         WHERE title = $1`,
        [v.title, v.description, v.category, v.file_path]
      );
      if (result.rowCount === 0) {
        await pool.query(
          `INSERT INTO videos (title, description, category, file_path)
           VALUES ($1, $2, $3, $4)`,
          [v.title, v.description, v.category, v.file_path]
        );
      }
      console.log(`Seeded: ${v.title}`);
    }
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
