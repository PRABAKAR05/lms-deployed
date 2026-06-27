require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/database');

const videos = [
  {
    title: 'Introduction to German',
    description: 'A quick introduction to the German language — greetings, alphabet, and basic phrases.',
    category: 'Language Learning',
    file_path: '/uploads/Introduction_German.mp4',
  },
  {
    title: 'Learning German Vocabulary',
    description: 'Expand your German vocabulary with common everyday words and useful expressions.',
    category: 'Language Learning',
    file_path: '/uploads/Learning_German.mp4',
  },
  {
    title: 'German Story Time',
    description: 'Listen to a simple German story to improve comprehension and pronunciation.',
    category: 'Language Learning',
    file_path: '/uploads/Story_German.mp4',
  },
];

async function seed() {
  try {
    for (const v of videos) {
      await pool.query(
        `INSERT INTO videos (title, description, category, file_path)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [v.title, v.description, v.category, v.file_path]
      );
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
