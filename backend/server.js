const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const cors = require('cors'); 
const { generateRelatedQuestions } = require('./routes/generateQuestions');

dotenv.config(); 

const app = express();

app.use(bodyParser.json());
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
