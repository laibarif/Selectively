const db = require('../config/db.js');
const express = require('express');
const router = express.Router();

// Route to fetch all questions for a subject
router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
  console.log(subject)
  const tableMapping = {
    Maths: 'selectively_mathsquestion',
    ThinkingSkills: 'selectively_thinkingskillsquestion',
    Writing: 'selectively_writingquestion',
    Reading: 'selectively_readingquestion',
  };
  const table = tableMapping[subject];
  if (!table) {
    return res.status(400).json({ error: 'Invalid subject' });
  }
  const query = `SELECT id, question, type FROM ${table} WHERE type = 'original'`;
  try {
    const [results] = await db.query(query); // Use async/await for the query
    res.json({ questions: results });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database error' });
  }

});

// Route to fetch complete question details by ID
router.get('/question/:id', async (req, res) => {
  const { id } = req.params;
  const subject = req.query.subject; // Make sure 'subject' is required and being sent

  if (!id || !subject) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  const tableMapping = {
    Maths: 'selectively_mathsquestion',
    ThinkingSkills: 'selectively_thinkingskillsquestion',
    Writing: 'selectively_writingquestion',
    Reading: 'selectively_readingquestion',
  };
  const table = tableMapping[subject];
  if (!table) {
    return res.status(400).json({ error: 'Invalid subject' });
  }
  const query = `SELECT * FROM ${table} WHERE id = ?`;
  try {
    const [results] = await db.query(query, [id]); // Promise-based query

    if (results.length > 0) {
      const question = results[0];
 
      // Convert image_data to Base64 if it exists
      question.image_data = question.image_data
        ? Buffer.from(question.image_data).toString('base64')
        : null;

      res.json(question); // Send the question as the response
    } else {
      res.status(404).json({ error: 'Question not found' }); // Handle "not found" case
    }
  } catch (err) {
    console.error('Database Error:', err); // Log the error
    res.status(500).json({ error: 'Database error' }); // Handle errors
  }
});

router.get('/generated/:originalQuestionId', async (req, res) => {
  const { originalQuestionId } = req.params;
  const { subject } = req.query;

  if (!originalQuestionId || !subject) {
    return res.status(400).json({ error: 'Original question ID and subject are required' });
  }

  try {
    const query = `SELECT * 
                   FROM selectively_${subject.toLowerCase()}question 
                   WHERE parent_question_id = ? AND type = 'Generated'
                   ORDER BY id DESC
                   LIMIT 5`;
    const [rows] = await db.query(query, [originalQuestionId]);

    if (rows.length === 0) {
      return res.json([]); // Return an empty array if no generated questions are found
    }

    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch generated questions' });
  }
});


router.get('/views-questions/:subject', async (req, res) => {
  const { subject } = req.params;
  console.log(subject);

  // Map subject to corresponding table
  let tableName = '';
  switch (subject) {
    case 'Maths':
      tableName = 'selectively_mathsquestion';
      break;
    case 'Reading':
      tableName = 'selectively_readingquestion';
      break;
    case 'ThinkingSkills':
      tableName = 'selectively_thinkingskillsquestion';
      break;
    case 'Writing':
      tableName = 'selectively_writingquestion';
      break;
    default:
      return res.status(400).json({ error: 'Invalid subject' });
  }

  try {
    // Query to fetch all entries from the corresponding table using db.query
    const [results] = await db.query(`SELECT * FROM ${tableName}`);

    // Send the questions data as a response
    res.json({ questions: results });
  } catch (err) {
    console.error('Error fetching questions:', err);
    return res.status(500).json({ error: 'Error fetching questions' });
  }
});





module.exports = router;
