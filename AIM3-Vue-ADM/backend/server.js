const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const atomicMintRoute = require('./api/atomicMint');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/atomicMint', atomicMintRoute);
app.use('/execute-agentic-purchase', require('./api/agenticPurchase'));
app.use('/analyze-scene', require('./api/analyzeScene'));
app.use('/agent', require('./api/agent'));
app.use('/amane-l0', require('./api/amaneGateway'));

// Short Link Handler (e.g., /f/abc12345) to avoid conflict with static files or other routes
// Using a prefix /f/ for safety in this mono-repo setup
app.use('/f', require('./api/amaneGateway'));

// Serve static files from the Vue app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA routing - send all other requests to index.html
app.get('*', (req, res) => {
  // Check if we are in API mode or serving static
  if (req.path.startsWith('/atomicMint')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(PORT, () => {
  console.log(`AIM3 Backend running on port ${PORT}`);
});
