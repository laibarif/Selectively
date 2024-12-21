const db = require('../config/db');
const express = require('express');
const router = express.Router();

router.get('/:subject', (req, res) => {
  const { subject } = req.params;

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

  const query = `SELECT question, type FROM ${table} WHERE type = 'original'`;
  console.log("Executing Query:", query);
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log("Query Results:", results);
    res.json({ questions: results });
  });
  });

module.exports = router;