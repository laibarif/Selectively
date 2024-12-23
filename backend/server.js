const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const freeAssesmentRoutes = require('./routes/freeAssesmentRoute');
const cors = require('cors'); 
const { generateRelatedQuestions } = require('./routes/generateQuestions');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.post('/api/generate-questions', async (req, res) => {
  console.log('Request Body:', req.body);

  const { originalQuestionId, subject } = req.body;

  if (!originalQuestionId || !subject) {
    return res.status(400).send('originalQuestionId and subject are required');
  }
  console.log('Request Body:', req.body);


  try {
    const generatedQuestions = await generateRelatedQuestions(originalQuestionId, subject);
    res.json({ success: true, questions: generatedQuestions });
  } catch (error) {
    res.status(500).send('Failed to generate questions');
  }
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/freeassesment', freeAssesmentRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
