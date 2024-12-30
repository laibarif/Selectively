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

  console.log(subject, originalQuestionId);

  if (!originalQuestionId || !subject) {
    return res.status(400).json({ error: 'Original question ID and subject are required' });
  }

  try {
    if (subject.toLowerCase() === 'reading') {
      // Verify if the extract_id exists
      const checkQuery = `SELECT id FROM selectively_extract WHERE id = ?`;
      const [extractRows] = await db.query(checkQuery, [originalQuestionId]);

      if (extractRows.length === 0) {
        return res.status(400).json({ error: 'Invalid extract ID. No corresponding entry in selectively_extract.' });
      }
    }

    let query;
    let params;

    if (subject.toLowerCase() === 'reading') {
      query = `
        SELECT * 
        FROM selectively_readingquestion 
        WHERE extract_id = ?
        AND type = 'Generated'
        ORDER BY id DESC
        LIMIT 5`;
      params = [originalQuestionId];
    } else {
      query = `
        SELECT * 
        FROM selectively_${subject.toLowerCase()}question 
        WHERE parent_question_id = ? 
        AND type = 'Generated'
        ORDER BY id DESC
        LIMIT 5`;
      params = [originalQuestionId, originalQuestionId];
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.json([]); // Return an empty array if no generated questions are found
    }

    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch generated questions' });
  }
});


router.get('/generated_extract/:originalQuestionId', async (req, res) => {
  const { originalQuestionId } = req.params;
  const { subject } = req.query;

  console.log(subject, originalQuestionId);

  if (!originalQuestionId || !subject) {
    return res.status(400).json({ error: 'Original question ID and subject are required' });
  }

  try {
    if (subject.toLowerCase() === 'reading') {
      // Verify if the extract_id exists
      const checkQuery = `SELECT id FROM selectively_extract WHERE id = ?`;
      const [extractRows] = await db.query(checkQuery, [originalQuestionId]);

      if (extractRows.length === 0) {
        return res.status(400).json({ error: 'Invalid extract ID. No corresponding entry in selectively_extract.' });
      }
    }

    let query;
    let params;
      query = `
        SELECT * 
        FROM selectively_readingquestion 
        WHERE extract_id = ?
        AND type = 'Generated'
        ORDER BY id DESC
        LIMIT 5`;
      params = [originalQuestionId];
    

    const [rows] = await db.query(query, params);

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

 const uploadImageData = (imageData) => {
  if (imageData) {
    const buffer = Buffer.from(imageData, 'base64');
    return buffer;
  }
  return null; // Return null if no image is provided
};

router.put('/update-questions/:id', upload.none(), async (req, res) => {
  const { id } = req.params;
  const { subject } = req.query; // Get the subject from query

  const { question, mcq_options, correct_answer, explanation, image_description, parent_question_id, image_data } = req.body;

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Map subject to corresponding table
  const tableMapping = {
    Maths: { table: 'selectively_mathsquestion', parentColumn: 'parent_question_id' },
    ThinkingSkills: { table: 'selectively_thinkingskillsquestion', parentColumn: 'parent_question_id' },
    Writing: { table: 'selectively_writingquestion', parentColumn: 'parent_question_id' },
    Reading: { table: 'selectively_readingquestion', parentColumn: 'extract_id' },
  };

  const tableInfo = tableMapping[subject];
  if (!tableInfo) {
    return res.status(400).json({ error: 'Invalid subject' });
  }

  const { table, parentColumn } = tableInfo;

  // Validate required fields
  if (!question || !mcq_options || !correct_answer) {
    return res.status(400).json({ error: 'Question, options, and correct answer are required' });
  }

  // Handle image data: If image_data is provided, convert it to Buffer, else store as null
  const imageBuffer = uploadImageData(image_data);

  try {
    // Dynamically build the update query
    let updateQuery = `
      UPDATE ${table} 
      SET question = ?, mcq_options = ?, correct_answer = ?, explanation = ?
    `;
    const queryParams = [question, mcq_options, correct_answer, explanation || null];

    // Add conditional columns for tables that support image and image_description
    if (subject === 'Maths' || subject === 'ThinkingSkills') {
      updateQuery += `, image_description = ?, image_data = ?`;
      queryParams.push(image_description || null, imageBuffer || null);
    }

    // Finalize the query
    updateQuery += ` WHERE id = ?`;
    queryParams.push(id);

    // Execute the query
    const [results] = await db.query(updateQuery, queryParams);

    if (results.affectedRows > 0) {
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
