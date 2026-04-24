// Simple server test
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test auth route
app.post('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth route working!',
    body: req.body
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/test`);
});