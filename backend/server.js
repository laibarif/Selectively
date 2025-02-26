const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const freeAssesmentRoutes = require('./routes/freeAssesmentRoute');
const addQuestionsRoute = require('./routes/addQuestionsRoute');
const subjectTestRoutes = require('./routes/subjectTestRoutes');
const practiceTestRoutes = require('./routes/practiceTestRoutes');
const cors = require('cors'); 
const { generateRelatedQuestions ,extractAndGenerateQuestions} = require('./routes/generateQuestions');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [process.env.FRONTEND_URL,  'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.get("/", (req, res) => {
  res.send("Hello World selectively");
});

app.post('/api/generate-questions', generateRelatedQuestions);
app.post('/api/extract-generate-questions', extractAndGenerateQuestions);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/freeassesment', freeAssesmentRoutes);
app.use('/api/addQuestions', addQuestionsRoute);
app.use("/api/test/subject-test", subjectTestRoutes);
app.use("/api/test", practiceTestRoutes);
// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
