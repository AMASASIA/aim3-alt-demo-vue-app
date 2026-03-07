const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const atomicMintRoute = require('./api/atomicMint');

const app = express();

// Security: Add various HTTP headers to prevent common attacks
app.use(helmet({
  contentSecurityPolicy: false, // Set to false if needed for external scripts/styles (like Google Fonts)
}));

// Rate Limiting: Prevent Brute-force and DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter); // Apply to API routes only

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
app.use('/consensus', require('./api/consensus'));

app.use('/opal', require('./api/opal_gateway'));
app.use('/deployment', require('./api/deployment_gateway'));
app.get('/system-health', (req, res) => {
  const os = require('os');
  const nodeMem = process.memoryUsage();
  res.json({
    timestamp: new Date().toISOString(),
    os: {
      totalMem: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      freeMem: (os.freemem() / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      usage: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(2) + '%'
    },
    node: {
      rss: (nodeMem.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (nodeMem.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (nodeMem.heapTotal / 1024 / 1024).toFixed(2) + ' MB'
    }
  });
});

const PYTHON_CORE_URL = process.env.PYTHON_CORE_URL || 'http://localhost:8000';

app.get('/core-status', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_CORE_URL}/`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Hyper Core connection failed', message: err.message });
  }
});

app.use('/api', require('./api/intent'));
app.use('/api/finance', require('./api/finance'));
app.use('/api/oke', require('./api/okeGateway'));
app.use('/api/artifacts', require('./api/artifacts'));

// Short Link Handler (e.g., /f/abc12345) to avoid conflict with static files or other routes
// Using a prefix /f/ for safety in this mono-repo setup
app.use('/f', require('./api/amaneGateway'));

// Serve static files from the Vue app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Handle SPA routing - send all other requests to index.html
app.get('*', (req, res) => {
  // Check if we are in API mode or serving static
  if (req.path.startsWith('/atomicMint') || req.path.startsWith('/agent') || req.path.startsWith('/consensus')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Centralized Error Handler (Security Best Practice)
app.use((err, req, res, next) => {
  console.error(`[Error] ${new Date().toISOString()}: ${err.message}`);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Vercel / Production Check
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`AIM3 Backend running on port ${PORT}`);
  });
}

module.exports = app;
