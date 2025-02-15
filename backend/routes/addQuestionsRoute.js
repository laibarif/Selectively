const express = require("express");
const db = require("../config/db.js");
const router = express.Router();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const stream = require('stream');
const xlsx = require("xlsx");
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, "..", "uploads") });

const ftpConfig = {
  host: '92.112.189.84',
  user: 'u500774472.selectiveexam.com.au',
  password: 'Amy@2023@2023',
  secure: false,
  port: 21
};

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
      category,
      exam_type
    } = req.body;
    console.log("Body", req.body)
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

    const query = `INSERT INTO original_maths (subject, question, mcq_options, correct_answer, explanation, image_data, image_description, level, type,category,exam_type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(query, [
      subject,
      question,
      mcq_options,
      correct_answer,
      explanation,
      imageUrl || null,
      image_description || null,
      level,
      type,
      category,
      exam_type
    ]);
    console.log('Inserting with:', {
      subject,
      question,
      mcq_options,
      correct_answer,
      explanation,
      imageUrl,
      image_description,
      level,
      type,
      category,
      exam_type
    });

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
      exam_type
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

    const query = `INSERT INTO original_thinkingskillsquestion (subject, question, mcq_options, correct_answer, explanation, image_data, image_description, level, type,exam_type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(query, [
      subject,
      question,
      mcq_options,
      correct_answer,
      explanation,
      imageUrl || null,
      image_description || null,
      level,
      type,
      exam_type
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
      type,
      category,
      exam_type
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
        (subject, question, mcq_options, correct_answer, explanation, extract_id, level, type, category, exam_type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

    await db.query(insertQuestionQuery, [subject, question, mcq_options, correct_answer, explanation, extract_id, level, type, category, exam_type]);

    res.status(201).json({ message: 'Math question added successfully!' });

  } catch (error) {
    console.error('Error adding math question:', error);
    res.status(500).json({ message: 'Failed to add math question', error });
  }
});


router.post('/addWritingQuestions', async (req, res) => {
  try {
    const { subject, question, type, exam_type } = req.body;

    if (!question || !subject) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Insert into original_writingquestion table
    const insertExtractQuery = `
        INSERT INTO original_writingquestion (subject, question, type, exam_type) 
        VALUES (?, ?, ?, ?);
      `;

    await db.query(insertExtractQuery, [subject, question, type, exam_type]);

    res.status(201).json({ message: 'Writing question added successfully!' });

  } catch (error) {
    console.error('Error adding writing question:', error);
    res.status(500).json({ message: 'Failed to add writing question', error });
  }
});

router.post("/import-questions", upload.single("file"), async (req, res) => {
  try {
    // Validate file presence
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No valid file uploaded." });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const questions = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Delete the file after processing
    fs.unlinkSync(filePath);

    // Check if the 'subject' column exists
    const hasSubject = questions.some((q) => q.subject);
    if (!hasSubject) {
      return res.status(400).json({ message: "The Excel file must contain a 'subject' column with valid subject names." });
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let duplicateCount = 0;
    const skippedRows = [];

    // Process each row individually
    for (const [index, question] of questions.entries()) {
      const {
        subject,
        question: qText,
        mcq_options,
        correct_answer,
        explanation,
        type,
        level,
        category,
        exam_type,
        text,
        parent_question_id,
      } = question;

      // Validate required fields
      if (!subject || !qText) {
        skippedCount++;
        skippedRows.push({
          row: index + 2,
          reason: "Missing subject or question.",
        });
        continue;
      }

      // Check for duplicate question
      const checkDuplicate = `SELECT COUNT(*) as count FROM ?? WHERE question = ? AND subject = ?`;
      let tableName;
      switch (subject.toLowerCase()) {
        case "maths":
          tableName = "original_maths";
          break;
        case "thinking skills":
          tableName = "original_thinkingskillsquestion";
          break;
        case "writing":
          tableName = "original_writingquestion";
          break;
        case "reading":
          tableName = "original_readingquestion";
          break;
        default:
          skippedCount++;
          skippedRows.push({
            row: index + 2,
            reason: `Invalid subject: ${subject}`,
          });
          continue;
      }

      const [duplicateCheckResult] = await db.query(checkDuplicate, [tableName, qText, subject]);
      if (duplicateCheckResult[0].count > 0) {
        duplicateCount++;
        skippedRows.push({
          row: index + 2,
          reason: `Duplicate question found: "${qText}" for subject "${subject}".`,
        });
        continue;
      }

      let query;
      let values;

      switch (subject.toLowerCase()) {
        case "maths":
          query = `INSERT INTO original_maths (subject, question, mcq_options, correct_answer, explanation, type, level, category, exam_type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          values = [subject, qText, mcq_options || null, correct_answer, explanation || null, type || null, level || null, category || null, exam_type || null];
          break;

        case "thinking skills":
          query = `INSERT INTO original_thinkingskillsquestion (subject, question, mcq_options, correct_answer, explanation, type, level, exam_type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
          values = [subject, qText, mcq_options || null, correct_answer, explanation || null, type || null, level || null, exam_type || null];
          break;

        case "writing":
          // Writing table requires only 'subject', 'question', 'type', 'exam_type'
          query = `INSERT INTO original_writingquestion (subject, question, type, exam_type) 
                   VALUES (?, ?, ?, ?)`;
          values = [subject, qText, type || "Original", exam_type || "Practice"];
          break;

        case "reading":
          // Insert into original_extract first
          if (!text) {
            skippedCount++;
            skippedRows.push({
              row: index + 2,
              reason: `Missing 'text' for reading question.`,
            });
            continue;
          }

          const insertExtractQuery = `
            INSERT INTO original_extract (subject, text, type) 
            VALUES (?, ?, ?)`;
          const [extractResult] = await db.query(insertExtractQuery, [subject, text, type || "Original"]);

          const extract_id = extractResult.insertId;

          query = `INSERT INTO original_readingquestion 
                   (subject, question, mcq_options, correct_answer, explanation, extract_id, level, type, category, exam_type) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          values = [subject, qText, mcq_options || null, correct_answer, explanation || null, extract_id, level || null, type || null, category || null, exam_type || null];
          break;

        default:
          skippedCount++;
          skippedRows.push({
            row: index + 2,
            reason: `Invalid subject: ${subject}`,
          });
          continue;
      }

      // Insert valid question into the correct table
      try {
        await db.query(query, values);
        insertedCount++;
      } catch (error) {
        console.error(`Database insertion failed for row ${index + 2}:`, error);
        skippedCount++;
        skippedRows.push({
          row: index + 2,
          reason: "Database insertion error.",
        });
      }
    }

    // Send a summary response
    res.status(200).json({
      message: `${insertedCount} questions imported successfully.`,
      skipped: skippedCount,
      duplicates: duplicateCount,
      details: skippedRows,
    });
  } catch (error) {
    console.error("Error importing questions:", error);
    res.status(500).json({ message: "Error processing file.", error });
  }
});


module.exports = router;
