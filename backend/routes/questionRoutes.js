const db = require('../config/db.js');
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const upload = multer();


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

  //  Show subjects detail on generated table to change its types

  router.get('/views-questions/:subject', async (req, res) => {
    const { subject } = req.params;
    
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
      // Query to fetch entries where type is 'original' or 'finalized'
      const [results] = await db.query(
        `SELECT * FROM ${tableName} WHERE type IN ('Original', 'Generated')`
      );
  
      // Send the filtered questions data as a response
      res.json({ questions: results });
    } catch (err) {
      console.error('Error fetching questions:', err);
      return res.status(500).json({ error: 'Error fetching questions' });
    }
  });

  
  
  //To change the type from generated or original to Finalized
  router.put('/update-question/:id', async (req, res) => {
    const { id } = req.params;
    const { subject } = req.query;  // Get the subject from query parameters
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
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
  
    try {
      // Query to update question type
      const [result] = await db.query(
        `UPDATE ${table} SET type = 'Finalized' WHERE id = ?`,
        [id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }
  
      res.status(200).json({ message: 'Question finalized successfully' });
    } catch (error) {
      console.error('Error updating question type:', error);
      res.status(500).json({ error: 'Error updating question type' });
    }
  });
  

//Delete one question on the basis of id from database
router.delete('/delete-question/:id', async (req, res) => {
  const { id } = req.params;
  const { subject } = req.query;  // Get the subject from query parameters

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Map subject to corresponding table
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

  try {
    // Attempt to delete the question from the appropriate table
    const [result] = await db.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);

    // Check for foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message: 'This question cannot be deleted as it is referenced by another record.',
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

//question detail from db on the basis of id and subject
router.get('/get-question/:id', async (req, res) => {
  const { id } = req.params;
  const { subject } = req.query;  // Get the subject from the query
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Map subject to corresponding table
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

  try {
    // Fetch question details from the corresponding table
    const [results] = await db.query(
      `SELECT * FROM ${table} WHERE id = ?`,
      [id]
    );

    if (results.length > 0) {
      const question = results[0];

      // Check if image_data exists and is a Buffer
      if (question.image_data && Buffer.isBuffer(question.image_data.data)) {
        const buffer = Buffer.from(question.image_data.data);
        const base64Image = buffer.toString('base64');
        question.image_data_base64 = `data:image/jpeg;base64,${base64Image}`;  // Modify MIME type if needed
      }

      res.status(200).json(question);  // Send the question details (with Base64 image) to the frontend
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Error fetching question' });
  }
});






 // Default memory storage

// Middleware to handle image data (for base64 or file)
const uploadImageData = (imageData) => {
  if (imageData) {
    const buffer = Buffer.from(imageData, 'base64');
    return buffer;
  }
  return null;  // Return null if no image is provided
};

router.put('/update-questions/:id', upload.none(), async (req, res) => {  // upload.none() to handle non-file fields
  const { id } = req.params;
  const { subject } = req.query;  // Get the subject from query

  const { question, mcq_options, correct_answer, explanation, image_description, parent_question_id, image_data } = req.body;  // Logging explanation
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Map subject to corresponding table
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

  // Validate required fields
  if (!question || !mcq_options || !correct_answer) {
    return res.status(400).json({ error: 'Question, options, and correct answer are required' });
  }

  // Handle image data: If image_data is provided, convert it to Buffer, else store as null
  const imageBuffer = uploadImageData(image_data);

  try {
    // Prepare the update query
    const updateQuery = `
      UPDATE ${table} 
      SET question = ?, mcq_options = ?, correct_answer = ?, explanation = ?, image_description = ?, image_data = ?, parent_question_id = ?
      WHERE id = ?
    `;
  
    // Execute the query to update the question
    const [results] = await db.query(updateQuery, [
      question, 
      mcq_options, 
      correct_answer, 
      explanation || null,  // Set to null if empty
      image_description || null, // Set to null if empty
      imageBuffer, // Store image data as Buffer
      parent_question_id || null, // Set to null if empty
      id
    ]);
console.log(results)
    if (results.affectedRows > 0) {
      // If the question was updated successfully, send a success response
      res.status(200).json({ message: 'Question updated successfully' });
    } else {
      res.status(404).json({ error: 'Question not found or no changes made' });
    }

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Error updating question' });
  }
});




module.exports = router;
