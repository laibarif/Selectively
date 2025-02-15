const db = require('../config/db.js');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload'); 
const stream = require('stream');
const xlsx = require("xlsx");

const ftpConfig = {
  host: '92.112.189.84', 
  user: 'u500774472.selectiveexam.com.au', 
  password: 'Amy@2023@2023', 
  secure: false, 
  port: 21 
};

// Route to fetch all questions for a subject
router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
 
  console.log(subject)
  const tableMapping = {
    Maths: 'original_maths',
    ThinkingSkills: 'original_thinkingskillsquestion',
    Writing: 'original_writingquestion',
    Reading: 'original_readingquestion',
  };
  const table = tableMapping[subject];
  if (!table) {
    return res.status(400).json({ error: 'Invalid subject' });
  }
  const query = `SELECT id, question, type FROM ${table} WHERE type = 'original'`;
  try {
    const [results] = await db.query(query); // Use async/await for the query
    

    const removeSpecialCharsQuestion = (question) => {
      return question
        .replace(/&#x[0-9A-Fa-f]+;/g, "") 
        .replace(/[^\w\s]/gi, ""); 
    };

    // Sanitize the extract_text field
    results.forEach((questions) => {
      questions.question = removeSpecialCharsQuestion(questions.question);
    });
    


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
    Maths: 'original_maths',
    ThinkingSkills: 'original_thinkingskillsquestion',
    Writing: 'original_writingquestion',
    Reading: 'original_readingquestion',
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
      // question.image_data = question.image_data
      //   ? Buffer.from(question.image_data).toString('base64')
      //   : null;

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
  const tableMapping = {
    Maths: 'original_maths',
    ThinkingSkills: 'original_thinkingskillsquestion',
    Writing: 'original_writingquestion',
    Reading: 'original_readingquestion',
  };
  const table = tableMapping[subject];
  if (!table) {
    return res.status(400).json({ error: 'Invalid subject' });
  }
  if (!originalQuestionId) {
    return res.status(400).json({ error: 'Original question ID are required' });
  }

  try {
    if (subject.toLowerCase() === 'reading') {
      // Verify if the extract_id exists
      const checkQuery = `SELECT id FROM original_extract WHERE id = ?`;
      const [extractRows] = await db.query(checkQuery, [originalQuestionId]);

      if (extractRows.length === 0) {
        return res.status(400).json({ error: 'Invalid extract ID. No corresponding entry in original_extract.' });
      }
    }

    let query;
    let params;

    if (subject.toLowerCase() === 'reading') {
      query = `
        SELECT * 
        FROM original_readingquestion 
        WHERE extract_id = ?
        AND type = 'Generated'
        ORDER BY id DESC
        LIMIT 5`;
      params = [originalQuestionId];
    } else {
      query = `
        SELECT * 
        FROM ${table} 
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
console.log("extract wala")
  console.log(subject, originalQuestionId);

  if (!originalQuestionId || !subject) {
    return res.status(400).json({ error: 'Original question ID and subject are required' });
  }

  try {
    let query;
    let params;
      query = `
        SELECT * 
        FROM original_readingquestion 
        WHERE extract_id = ?
        AND type = 'Generated'
        ORDER BY id DESC
        LIMIT 5`;
      params = [originalQuestionId];
    

    const [rows] = await db.query(query, params);
console.log("rows ", rows)
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
        tableName = 'original_maths';
        break;
      case 'Reading':
        tableName = 'original_readingquestion';
        break;
      case 'ThinkingSkills':
        tableName = 'original_thinkingskillsquestion';
        break;
      case 'Writing':
        tableName = 'original_writingquestion';
        break;
      default:
        return res.status(400).json({ error: 'Invalid subject' });
    }
  
    try {
      
      
      // Query to fetch entries where type is 'original' or 'finalized'
      const [results] = await db.query(
        `SELECT * FROM ${tableName}`
      );
     
      const removeSpecialCharsQuestion = (question) => {
        return question
          .replace(/&#x[0-9A-Fa-f]+;/g, "") 
          .replace(/[^\w\s]/gi, ""); 
      };
  
      // Sanitize the extract_text field
      results.forEach((questions) => {
        questions.question = removeSpecialCharsQuestion(questions.question);
      });
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
      Maths: 'original_maths',
      ThinkingSkills: 'original_thinkingskillsquestion',
      Writing: 'original_writingquestion',
      Reading: 'original_readingquestion',
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
    Maths: 'original_maths',
    ThinkingSkills: 'original_thinkingskillsquestion',
    Writing: 'original_writingquestion',
    Reading: 'original_readingquestion',
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
  const { subject } = req.query; // Get the subject from the query
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Map subject to corresponding table
  const tableMapping = {
    Maths: 'original_maths',
    ThinkingSkills: 'original_thinkingskillsquestion',
    Writing: 'original_writingquestion',
    Reading: 'original_readingquestion',
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
    const removeSpecialCharsQuestion = (question) => {
      return question
        .replace(/&#x[0-9A-Fa-f]+;/g, "") // Remove HTML entities like &#xE2;
        .replace(/[^\w\s]/gi, ""); // Remove non-alphanumeric characters except spaces
    };

    // Sanitize the extract_text field
    results.forEach((questions) => {
      questions.question = removeSpecialCharsQuestion(questions.question);
    });
    if (results.length > 0) {
      const question = results[0];

      res.status(200).json(question);
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Error fetching question' });
  }
});

// Subject-to-Table Mapping
const tableMapping = {
  Maths: { table: 'original_maths', parentColumn: 'parent_question_id', folder: 'mathematical_reasoning' },
  ThinkingSkills: { table: 'original_thinkingskillsquestion', parentColumn: 'parent_question_id', folder: 'thinking_skills' },
  Writing: { table: 'original_writingquestion', parentColumn: 'parent_question_id', folder: null },
  Reading: { table: 'original_readingquestion', parentColumn: 'extract_id', folder: null },
};

// **Update Question API**
router.put('/update-questions/:id', upload.single('image_data'), async (req, res) => {
  try {
    const { id } = req.params;
    const { subject } = req.query; // Subject from query
    const { question, mcq_options, correct_answer, explanation, category, exam_type, image_description, parent_question_id } = req.body;
    const imageFile = req.file; 
    console.log("Uploaded file:", req.file);

    // Validate Subject
    if (!subject || !tableMapping[subject]) {
      return res.status(400).json({ error: 'Invalid or missing subject' });
    }

    const { table, parentColumn, folder } = tableMapping[subject];
    let imageUrl = null;

    // Upload Image if Provided
    if (imageFile && folder) {
      const imageName = `${Date.now()}-${imageFile.originalname}`;
      const client = new ftp.Client();
      client.ftp.verbose = true;
    
      try {
        await client.access(ftpConfig);
        const uploadPath = `/public_html/images/${folder}/${imageName}`;
    
        // Ensure directory exists
        await client.ensureDir(`/public_html/images/${folder}`);
    
        // Convert buffer to stream
        const bufferStream = new stream.PassThrough();
        bufferStream.end(imageFile.buffer);
        await client.uploadFrom(bufferStream, uploadPath);
    
        imageUrl = `selectiveexam.com.au/images/${folder}/${imageName}`;
      } catch (error) {
        console.error('FTP Upload Error:', error);
        return res.status(500).json({ error: 'Failed to upload image to FTP' });
      } finally {
        client.close();
      }
    }

    // Dynamically Build Update Query
    let updateQuery = `UPDATE ${table} SET `;
    const queryParams = [];

    if (question) {
      updateQuery += `question = ?, `;
      queryParams.push(question);
    }
    if (mcq_options) {
      updateQuery += `mcq_options = ?, `;
      queryParams.push(mcq_options);
    }
    if (correct_answer) {
      updateQuery += `correct_answer = ?, `;
      queryParams.push(correct_answer);
    }
    if (explanation) {
      updateQuery += `explanation = ?, `;
      queryParams.push(explanation);
    }
    if (category) {
      updateQuery += `category = ?, `;
      queryParams.push(category);
    }
    if (exam_type) {
      updateQuery += `exam_type = ?, `;
      queryParams.push(exam_type);
    }
    if (image_description) {
      updateQuery += `image_description = ?, `;
      queryParams.push(image_description);
    }
    if (imageUrl) {
      updateQuery += `image_data = ?, `;
      queryParams.push(imageUrl);
    }
    if (parent_question_id && table !== 'original_readingquestion') {
      updateQuery += `${parentColumn} = ?, `;
      queryParams.push(parent_question_id);
    }

    updateQuery = updateQuery.slice(0, -2); // Remove trailing comma
    updateQuery += ` WHERE id = ?`;
    queryParams.push(id);

    // Execute Query
    const [results] = await db.query(updateQuery, queryParams);

    if (results.affectedRows > 0) {
      res.status(200).json({ message: 'Question updated successfully!' });
    } else {
      res.status(404).json({ error: 'Question not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;