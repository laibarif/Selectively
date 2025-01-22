const express = require("express");
const db = require("../config/db.js");
const router = express.Router();
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload'); // Import express-fileupload

const ftpConfig = {
  host: '92.112.189.84', 
  user: 'u500774472.selectiveexam.com.au', 
  password: 'Amy@2023@2023', 
  secure: false, 
  port: 21 
};

// Use the fileUpload middleware before your route
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
  
      // Check that all required fields are present
      if (!question || !mcq_options || !correct_answer || !explanation || !level || !type || !subject) {
        return res.status(400).json({ message: 'All fields except image_description are required.' });
      }
  
      // Check if an image was uploaded
      const imageFile = req.files ? req.files.image_data : null;
      let imageUrl = null;
  
      // If image data is provided, process it
      if (imageFile) {
        console.log("imageFile", imageFile);
  
        const imageName = Date.now() + '-' + imageFile.name;
  
        // Define the temporary path
        const tempFilePath = path.join(__dirname, 'uploads', imageName);
  
        // Ensure the directory exists
        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
  
        // Write the image buffer to a temporary file
        fs.writeFileSync(tempFilePath, imageFile.data);
  
        const client = new ftp.Client();
  
        try {
          await client.access(ftpConfig);
          const folderName = 'mathematical_reasoning'; 
          const uploadPath = `/public_html/images/${folderName}/${imageName}`;
  
          // Upload the file to the FTP server
          await client.uploadFrom(tempFilePath, uploadPath);
  
          // Construct the URL of the uploaded image
          imageUrl = `https://selectiveexam.com.au/images/${folderName}/${imageName}`;
          console.log("Image URL:", imageUrl);
        } catch (error) {
          console.error('FTP upload error:', error);
          return res.status(500).json({ message: 'Failed to upload image to FTP', error });
        } finally {
          client.close();
          // Delete the temporary file after uploading it to FTP
          fs.unlinkSync(tempFilePath);
        }
      }
  
      // Save question data to the database
      const query = `INSERT INTO selectively_mathsquestion (subject, question, mcq_options, correct_answer, explanation, image_data, image_description, level, type)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      const [result] = await db.query(query, [
        subject, 
        question, 
        mcq_options, 
        correct_answer, 
        explanation, 
        imageUrl || null,  // Use null if image is not uploaded
        image_description || null,  // Use null if image_description is not provided
        level, 
        type
      ]);
  
      res.status(201).json({
        message: 'Math question added successfully!',
        question: result, // Send back the saved result (optional)
      });
    } catch (error) {
      console.error('Error adding math question:', error);
      res.status(500).json({ message: 'Failed to add math question', error });
    }
  });
  
module.exports = router;
