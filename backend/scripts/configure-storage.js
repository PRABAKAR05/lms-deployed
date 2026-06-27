require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/database');

async function configureStorage() {
  await pool.query(`
    INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
    VALUES ('videos', 'videos', true, ARRAY['video/mp4'])
    ON CONFLICT (id)
    DO UPDATE SET
      public = true,
      allowed_mime_types = ARRAY['video/mp4']
  `);

  console.log('Configured public Supabase Storage bucket: videos');
}

configureStorage()
  .catch((err) => {
    console.error('Storage configuration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
