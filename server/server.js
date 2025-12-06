const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Simple message storage (in-memory)
const messages = [];

// MongoDB Connection (optional - will work without it)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.log('⚠️  MongoDB connection error:', err.message);
    console.log('App will continue without database (messages won\'t be saved)');
  });
} else {
  console.log('⚠️  No MONGODB_URI provided. App will run without database.');
}

// API Routes for storing messages
app.post('/api/messages', upload.array('images', 10), async (req, res) => {
  try {
    const { text } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    const message = {
      id: Date.now(),
      text: text || '',
      images,
      createdAt: new Date(),
      status: 'stored'
    };
    
    messages.push(message);
    
    res.json({
      success: true,
      message: 'Message stored successfully',
      data: message
    });
  } catch (error) {
    console.error('Error storing message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    messages: messages.slice(-50).reverse() // Last 50 messages
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Warehouse Message API is running',
    endpoints: {
      'POST /api/messages': 'Store text and images',
      'GET /api/messages': 'Get stored messages'
    }
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
