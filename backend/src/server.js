// =============================================================================
// RELIEFROUTE: Express Server Entrypoint
// =============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ReliefRoute Disaster Management Command & Allocation Engine API is running.',
    version: '1.0.0-PROTOTYPE',
    docs: '/api/health',
    region: 'Uttarakhand Demonstration Grid'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=================================================================`);
  console.log(`  RELIEFROUTE BACKEND SERVER LISTENING ON PORT ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Ready for academic prototype demonstration`);
  console.log(`=================================================================`);
});
