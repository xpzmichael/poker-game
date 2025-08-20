import express from 'express';

const app = express();
const PORT = 3001; // Using a different port to avoid conflicts

// This is the line you suspect is causing the error.
// We are testing it in isolation.
app.get('{*splat}', (req, res) => {
  res.send('Minimal server is working!');
});

app.listen(PORT, () => {
  console.log(`✅ Minimal test server running on http://localhost:${PORT}`);
});