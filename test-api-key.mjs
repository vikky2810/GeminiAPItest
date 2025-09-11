import 'dotenv/config';
import fetch from 'node-fetch';

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY not set. Create a .env with GEMINI_API_KEY=...');
  process.exit(2);
}

const url = `https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key)}`;

(async () => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    console.log('HTTP', res.status);
    if (res.status === 200) {
      console.log('✅ Valid & working API key');
      process.exit(0);
    } else if (res.status === 401) {
      console.error('❌ Invalid API key');
      process.exit(1);
    } else {
      console.warn(`⚠️ Key might be valid but restricted (status: ${res.status})`);
      process.exit(0);
    }
  } catch (err) {
    console.error('⚠️ Network error:', err?.message || err);
    process.exit(3);
  }
})();


