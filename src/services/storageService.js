/**
 * storageService.js
 * Fetches private ebook files from Supabase Storage using the
 * service-role key (server-side only — never exposed to the client).
 *
 * Replaces the previous AWS S3 implementation.
 */

const { createClient } = require('@supabase/supabase-js');

// Lazily-created Supabase client — instantiated on first use so the
// app can boot (and show helpful errors) before .env is fully configured.
let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
    );
  }

  // Use the SERVICE ROLE key — bypasses Row-Level Security for server access.
  // This key must NEVER be sent to the browser.
  _supabase = createClient(url, key, {
    auth: {
      persistSession: false,   // stateless server usage
      autoRefreshToken: false,
    },
  });

  return _supabase;
}

const BUCKET = () => process.env.SUPABASE_STORAGE_BUCKET || 'ebooks';

/**
 * Downloads a file from Supabase Storage and returns it as a Buffer.
 *
 * The bucket should be set to PRIVATE in the Supabase dashboard.
 * The service-role key grants access without a public URL being generated.
 *
 * @param {string} storagePath - Path inside the bucket (e.g. "books/guide.pdf")
 * @returns {Promise<Buffer>} Raw file bytes
 */
async function fetchStorageObject(storagePath) {
  const supabase = getClient();

  const { data, error } = await supabase.storage
    .from(BUCKET())
    .download(storagePath);

  if (error) {
    throw new Error(`Supabase Storage error: ${error.message}`);
  }

  if (!data) {
    throw new Error(`File not found in storage: ${storagePath}`);
  }

  // Supabase returns a Blob — convert to Node.js Buffer for pdf-lib
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { fetchStorageObject };
