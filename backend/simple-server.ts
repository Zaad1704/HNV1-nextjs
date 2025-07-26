import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HNV1 Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API Documentation - Coming soon',
    endpoints: [
      'GET /health - Health check',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login'
    ]
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration endpoint ready - Database connection needed',
    data: null
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint ready - Database connection needed',
    data: null
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});