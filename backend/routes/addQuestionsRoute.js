const express = require("express");
const db = require("../config/db.js");
const router = express.Router();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload'); 

const ftpConfig = {
  host: '92.112.189.84', 
  user: 'u500774472.selectiveexam.com.au', 
  password: 'Amy@2023@2023', 
  secure: false, 
  port: 21 
};

router.use(fileUpload());

router.post('/addMathQuestions', async (req, res) => {
    try {
      const {
        subject,
        question,
        mcq_options,
        correct_answer,
        explanation,
        image_description,
        level,
        type,
      } = req.body;
  
      if (!question || !mcq_options || !correct_answer || !explanation || !level || !type || !subject) {
        return res.status(400).json({ message: 'All fields except image_description are required.' });
      }
  
      const imageFile = req.files ? req.files.image_data : null;
      let imageUrl = null;
  
      if (imageFile) { 
        const imageName = Date.now() + '-' + imageFile.name;
  
        const tempFilePath = path.join(__dirname, 'uploads', imageName);

        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
  
       
        fs.writeFileSync(tempFilePath, imageFile.data);
  
        const client = new ftp.Client();
  
        try {
          await client.access(ftpConfig);
          const folderName = 'mathematical_reasoning'; 
          const uploadPath = `/public_html/images/${folderName}/${imageName}`;
  
          await client.uploadFrom(tempFilePath, uploadPath);
  
          imageUrl = `selectiveexam.com.au/images/${folderName}/${imageName}`;
        } catch (error) {
          console.error('FTP upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image to FTP', error });
        } finally {
          client.close();

          fs.unlinkSync(tempFilePath);
        }
      }
  
      const query = `INSERT INTO original_maths (subject, question, mcq_options, correct_answer, explanation, image_data, image_description, level, type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const [result] = await db.query(query, [
        subject, 
        question, 
        mcq_options, 
        correct_answer, 
        explanation, 
        imageUrl || null, 
        image_description || null,  
        level, 
        type
      ]);
  
      res.status(201).json({
        message: 'Math question added successfully!',
        question: result, 
      });
    } catch (error) {
      console.error('Error adding math question:', error);
      res.status(500).json({ message: 'Failed to add math question', error });
    }
  });

  router.post('/addThinkingSkillQuestions', async (req, res) => {
    try {
      const {
        subject,
        question,
        mcq_options,
        correct_answer,
        explanation,
        image_description,
        level,
        type,
      } = req.body;
  
      if (!question || !mcq_options || !correct_answer || !explanation || !level || !type || !subject) {
        return res.status(400).json({ message: 'All fields except image_description are required.' });
      }
  
      const imageFile = req.files ? req.files.image_data : null;
      let imageUrl = null;
  
      if (imageFile) { 
        const imageName = Date.now() + '-' + imageFile.name;
  
        const tempFilePath = path.join(__dirname, 'uploads', imageName);

        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
  
       
        fs.writeFileSync(tempFilePath, imageFile.data);
  
        const client = new ftp.Client();
  
        try {
          await client.access(ftpConfig);
          const folderName = 'thinking_skills'; 
          const uploadPath = `/public_html/images/${folderName}/${imageName}`;
  
          await client.uploadFrom(tempFilePath, uploadPath);
  
          imageUrl = `selectiveexam.com.au/images/${folderName}/${imageName}`;
        } catch (error) {
          console.error('FTP upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image to FTP', error });
        } finally {
          client.close();

          fs.unlinkSync(tempFilePath);
        }
      }
  
      const query = `INSERT INTO original_thinkingskillsquestion (subject, question, mcq_options, correct_answer, explanation, image_data, image_description, level, type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const [result] = await db.query(query, [
        subject, 
        question, 
        mcq_options, 
        correct_answer, 
        explanation, 
        imageUrl || null, 
        image_description || null,  
        level, 
        type
      ]);
  
      res.status(201).json({
        message: 'Math question added successfully!',
        question: result, 
      });
    } catch (error) {
      console.error('Error adding math question:', error);
      res.status(500).json({ message: 'Failed to add math question', error });
    }
  });
 
  router.post('/addReadingQuestions', async (req, res) => {
    try {
      const { 
        subject, 
        question, 
        mcq_options, 
        correct_answer, 
        explanation, 
        text, 
        level, 
        type 
      } = req.body;
 
      if (!question || !mcq_options || !correct_answer || !explanation || !level || !type || !subject) {
        return res.status(400).json({ message: 'All fields except image_description are required.' });
      }
  
      // Insert into original_extract table and get the generated extract_id
      const insertExtractQuery = `
      INSERT INTO original_extract (subject, text, type) 
      VALUES (?, ?, ?);
    `;

    await db.query(insertExtractQuery, [subject, text, type]);

    const [result] = await db.query('SELECT LAST_INSERT_ID()');
    const extract_id = result[0]['LAST_INSERT_ID()']; 
  
      // Insert into original_readingquestion table
      const insertQuestionQuery = `
        INSERT INTO original_readingquestion 
        (subject, question, mcq_options, correct_answer, explanation, extract_id, level, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `;
  
      await db.query(insertQuestionQuery, [subject, question, mcq_options, correct_answer, explanation, extract_id, level, type]);
  
      res.status(201).json({ message: 'Math question added successfully!' }); 
  
    } catch (error) {
      console.error('Error adding math question:', error);
      res.status(500).json({ message: 'Failed to add math question', error });
    }
  });


  router.post('/addWritingQuestions', async (req, res) => {
    try {
      const { subject, question, type } = req.body;
  
      if (!question || !subject) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Insert into original_writingquestion table
      const insertExtractQuery = `
        INSERT INTO original_writingquestion (subject, question, type) 
        VALUES (?, ?, ?);
      `;
  
      await db.query(insertExtractQuery, [subject, question, type]);
  
      res.status(201).json({ message: 'Writing question added successfully!' });
  
    } catch (error) {
      console.error('Error adding writing question:', error);
      res.status(500).json({ message: 'Failed to add writing question', error });
    }
  });


module.exports = router;
