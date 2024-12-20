const express = require("express");
const db = require("../config/db.js");
const nodemailer = require('nodemailer');
const router = express.Router();

// Route to create user details for assessment
router.post("/userdetailforassesment", async (req, res) => {
  const { username, email } = req.body;

  // Validation
  if (!username || !email) {
    return res
      .status(400)
      .json({ message: "Username and email are required." });
  }

  try {
    // Check if email already exists and get the is_assessed value
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM userdetailforassesment WHERE email = ?", [email]);

    // If the user exists and is_assessed is 1 (true), return an error message
    if (existingUser.length > 0 && existingUser[0].is_assessed === 1) {
      return res
        .status(400)
        .json({ message: "Email already exists. Free trial used." });
    }

    // If the user exists and is_assessed is 0, update the record
    if (existingUser.length > 0 && existingUser[0].is_assessed === 0) {
      await db
        .promise()
        .query(
          "UPDATE userdetailforassesment SET username = ?, is_assessed = true WHERE email = ?",
          [username, email]
        );
      return res
        .status(200)
        .json({ message: "User details updated for assessment." });
    }

    // If the user doesn't exist, insert new user details for assessment into the table
    await db
      .promise()
      .query(
        "INSERT INTO userdetailforassesment (username, email, is_assessed) VALUES (?, ?, false)",
        [username, email]
      );

    res.status(201).json({ message: "User details added for assessment." });
  } catch (error) {
    console.error("Error adding user details:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/randomMathsQuestions", async (req, res) => {
  try {
    // Query to get 10 random rows where type is 'finalized'
    const [questions] = await db
      .promise()
      .query(
        'SELECT * FROM selectiveexam.selectively_mathsquestion WHERE type = "finalized" ORDER BY RAND() LIMIT 10'
      );

    // Send the retrieved data in the response
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error retrieving random maths questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/randomThinkingskillQuestions", async (req, res) => {
  try {
    // Query to get 10 random rows where type is 'finalized'
    const [questions] = await db
      .promise()
      .query(
        'SELECT * FROM selectiveexam.selectively_thinkingskillsquestion WHERE type = "finalized" ORDER BY RAND() LIMIT 10'
      );

    // Send the retrieved data in the response
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error retrieving random thinkingskill questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/randomReadingQuestions", async (req, res) => {
  try {
    // Query to get 10 random rows where type is 'finalized'
    const [questions] = await db
      .promise()
      .query(
        'SELECT * FROM selectiveexam.selectively_readingquestion WHERE type = "finalized" ORDER BY RAND() LIMIT 10'
      );

    // Send the retrieved data in the response
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error retrieving random reading questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/submitMathsAssessment", async (req, res) => {
  const { email, score } = req.body;

  if (!email || score === undefined) {
    return res.status(400).json({ message: "Email and score are required." });
  }

  try {
    // Update the maths_score based on the user's email
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET maths_score = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, email]);

    res
      .status(200)
      .json({ message: "Maths assessment score updated successfully." });
  } catch (error) {
    console.error("Error updating maths score:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to submit thinking skills assessment score
router.post("/submitThinkingSkillsAssessment", async (req, res) => {
  const { email, score } = req.body;

  if (!email || score === undefined) {
    return res.status(400).json({ message: "Email and score are required." });
  }

  try {
    // Update the thinking_skills_score based on the user's email
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET thinking_skills_score = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, email]);

    res
      .status(200)
      .json({
        message: "Thinking skills assessment score updated successfully."
      });
  } catch (error) {
    console.error("Error updating thinking skills score:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to submit reading assessment score
router.post("/randomReadingQuestions", async (req, res) => {
  const { email, score } = req.body;

  if (!email || score === undefined) {
    return res.status(400).json({ message: "Email and score are required." });
  }

  try {
    // Update the reading_score based on the user's email
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET reading_score = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, email]);

    res
      .status(200)
      .json({ message: "Reading assessment score updated successfully." });
  } catch (error) {
    console.error("Error updating reading score:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post('/send-user-details', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const connection = db.promise();

    // Query the user detail for assessment table
    const [results] = await connection.query(
      'SELECT * FROM selectiveexam.userdetailforassesment WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found in the table.' });
    }

    const userDetails = results[0]; // Assuming the email is unique in the table

    userDetails.totalScore =
      userDetails.maths_score +
      userDetails.thinking_skills_score +
      userDetails.reading_score;

    // Create email content
    const emailContent = `
      Dear ${userDetails.username} ${userDetails.email},

      Here are your assessment details:
      - Exam Date: ${userDetails.created_at}
      - Math Score: ${userDetails.maths_score}
      - Thinking Skill Score: ${userDetails.thinking_skills_score}
      - Reading Score: ${userDetails.reading_score}
      - Total Score you obtained: ${userDetails.totalScore}
      
      Thank you for using our service!
    `;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Assessment Details',
      text: emailContent,
    };

    // Send email
    transporter.sendMail(mailOptions, async (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Failed to send email.' });
      }

      try {
        // Update the is_assessed field to 1
        await connection.query(
          'UPDATE selectiveexam.userdetailforassesment SET is_assessed = 1 WHERE email = ?',
          [email]
        );

        res.status(200).json({
          message: 'Assessment details sent successfully via email, and is_assessed updated to 1.',
        });
      } catch (updateError) {
        console.error('Error updating is_assessed field:', updateError);
        res.status(500).json({ message: 'Email sent, but failed to update is_assessed field.' });
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'An error occurred while retrieving user details.' });
  }
});





module.exports = router;
