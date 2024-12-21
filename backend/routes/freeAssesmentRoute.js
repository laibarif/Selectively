const express = require("express");
const db = require("../config/db.js");
const nodemailer = require('nodemailer');
const router = express.Router();

router.post("/userdetailforassesment", async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res
      .status(400)
      .json({ message: "Username and email are required." });
  }

  try {
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM userdetailforassesment WHERE email = ?", [email]);

    if (existingUser.length > 0 && existingUser[0].is_assessed === 1) {
      return res
        .status(400)
        .json({ message: "Email already exists. Free trial used." });
    }

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
    // Execute the query with self-join to fetch image_data and image_description
    const [questions] = await db
      .promise()
      .query(
        `SELECT 
            q.*, 
            p.image_data, 
            p.image_description 
         FROM 
            selectively_mathsquestion q
         LEFT JOIN 
            selectively_mathsquestion p ON q.parent_question_id = p.id
         WHERE 
            q.type = "finalized"
         ORDER BY 
            RAND() 
         LIMIT 10`
      );

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found." });
    }

    // Convert the image_data to base64 and add the 'data:image/png;base64,' prefix
    const processedQuestions = questions.map(question => {
      if (question.image_data) {
        // Convert binary data to base64 string and prefix with data:image/png;base64,
        const base64Image = `data:image/png;base64,${question.image_data.toString('base64')}`;
        question.image_data = base64Image;
      }
      return question;
    });

    res.status(200).json({ questions: processedQuestions });
  } catch (error) {
    console.error("Error retrieving random maths questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});



router.get("/randomThinkingskillQuestions", async (req, res) => {
  try {
    const [questions] = await db
      .promise()
      .query(
        'SELECT * FROM selectiveexam.selectively_thinkingskillsquestion WHERE type = "finalized" ORDER BY RAND() LIMIT 10'
      );

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error retrieving random thinkingskill questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/randomReadingQuestions", async (req, res) => {
  try {
    const [questions] = await db
      .promise()
      .query(
        'SELECT * FROM selectiveexam.selectively_readingquestion WHERE type = "finalized" ORDER BY RAND() LIMIT 10'
      );

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error retrieving random reading questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});



router.post("/submitMathsAssessment", async (req, res) => {
  const { email, score, questionStatus } = req.body;

  if (!email || score === undefined || !questionStatus) {
    return res.status(400).json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET maths_score = ?, maths_question_status = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, JSON.stringify(questionStatus), email]);

    res
      .status(200)
      .json({ message: "Maths assessment score and question status updated successfully." });
  } catch (error) {
    console.error("Error updating maths score and question status:", error);
    res.status(500).json({ message: "Server error." });
  }
});



router.post("/submitThinkingSkillsAssessment", async (req, res) => {
  const { email, score, questionStatus } = req.body;

  if (!email || score === undefined || !questionStatus) {
    return res.status(400).json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET thinking_skills_score = ?, thinking_skills_question_status = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, JSON.stringify(questionStatus), email]);

    res
      .status(200)
      .json({ message: "Thinking skills assessment score and question status updated successfully." });
  } catch (error) {
    console.error("Error updating thinking skills score and question status:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/randomReadingQuestions", async (req, res) => {
  const { email, score, questionStatus } = req.body;
  if (!email || score === undefined || !questionStatus) {
    return res.status(400).json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE selectiveexam.userdetailforassesment
      SET reading_score = ?, reading_question_status = ?
      WHERE email = ?
    `;
    const [result] = await db.promise().query(query, [score, JSON.stringify(questionStatus), email]);

    res
      .status(200)
      .json({ message: "Reading assessment score and question status updated successfully." });
  } catch (error) {
    console.error("Error updating reading score and question status:", error);
    res.status(500).json({ message: "Server error." });
  }
});


async function checkTestScore(email, scoreColumn) {
  try {
    const query = `SELECT ${scoreColumn} FROM selectiveexam.userdetailforassesment WHERE email = ?`;
    const [result] = await db.promise().query(query, [email]);
    if (result.length === 0) {
      console.error(`No user found with email: ${email}`);
      return { error: "User not found." };
    }
    const score = result[0][scoreColumn];
    const isIncomplete = score === null;
    return {
      incomplete: isIncomplete,
      message: isIncomplete
        ? `The test for ${scoreColumn.replace('_', ' ')} is incomplete.`
        : `The test for ${scoreColumn.replace('_', ' ')} is already completed.`,
    };
  } catch (error) {
    console.error(`Error checking ${scoreColumn} score for email ${email}:`, error);
    throw new Error('Database query failed.');
  }
}


router.post('/checkReadingTestAlreadyConduct', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  
  try {
    const query = `
      SELECT reading_score
      FROM selectiveexam.userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    const [result] = await db.promise().query(query, [email]);
console.log(result)
    if (!result) {
      console.error(`No record found for email: ${email}`);
      return res.status(400).json({ message: "User not found." });
    }

    const { reading_score } = result[0];

    if (reading_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false,  // Custom key to indicate navigation should not happen
      });
    }
    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true,
    });

  } catch (error) {
    console.error(`Error checking reading_score for email ${email}:`, error);
    res.status(500).json({ message: 'Server error.' });
  }
});



// Route to check math test
router.post('/checkMathTestAlreadyConduct', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
      SELECT maths_score
      FROM selectiveexam.userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    const [result] = await db.promise().query(query, [email]);
   

    if (!result || result.length === 0) {
      console.error(`No record found for email: ${email}`);
      return res.status(400).json({ message: "User not found." });
    }

    const { maths_score } = result[0];
    if (maths_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false,  // Custom key to indicate navigation should not happen
      });
    }
    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true,
    });
  } catch (error) {
    console.error(`Error checking reading_score for email ${email}:`, error);
    res.status(500).json({ message: 'Server error.' });
  }
});


// Route to check thinking skills test
router.post('/checkThinkingSkillsTestAlreadyConduct', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
      SELECT thinking_skills_score
      FROM selectiveexam.userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    const [result] = await db.promise().query(query, [email]);
   

    if (!result || result.length === 0) {
      console.error(`No record found for email: ${email}`);
      return res.status(400).json({ message: "User not found." });
    }

    const { thinking_skills_score } = result[0];
    if (maths_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false,  // Custom key to indicate navigation should not happen
      });
    }
    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true,
    });
  } catch (error) {
    console.error(`Error checking thinking_skills_score for email ${email}:`, error);
    res.status(500).json({ message: 'Server error.' });
  }
});






// Function to check if it's a string and parse it
const safeParse = (data) => {
  try {
    // Check if the data is a string, and then parse it
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

router.post('/send-user-details', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const connection = db.promise();
    const [results] = await connection.query(
      'SELECT * FROM selectiveexam.userdetailforassesment WHERE email = ?',
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found in the table.' });
    }

    const userDetails = results[0];

    // Safely parse the JSON fields
    const mathsQuestionStatus = safeParse(userDetails.maths_question_status);
    const thinkingSkillsQuestionStatus = safeParse(userDetails.thinking_skills_question_status);
    const readingQuestionStatus = safeParse(userDetails.reading_question_status);

    // Function to count attempted and unattempted questions
    const countAttempts = (questionStatus) => {
      const attempted = questionStatus.filter(item => item.status === 'attempted').length;
      const unattempted = questionStatus.filter(item => item.status !== 'attempted').length;
      return { attempted, unattempted };
    };

    // Get the counts for each subject
    const maths = countAttempts(mathsQuestionStatus);
    const thinkingSkills = countAttempts(thinkingSkillsQuestionStatus);
    const reading = countAttempts(readingQuestionStatus);

    // Calculate total score
    userDetails.totalScore =
      userDetails.maths_score +
      userDetails.thinking_skills_score +
      userDetails.reading_score;

      const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="https://yourdomain.com/logo.png" alt="School Logo" style="width: 150px;">
            </div>
    
            <!-- Heading Section -->
            <h2 style="text-align: center; color: #333;">Your Assessment Result</h2>
            
            <!-- User Information -->
            <p style="color: #555; font-size: 16px;">
              Dear ${userDetails.username},<br><br>
              We are pleased to share the results of your recent assessment. Please find the details below:
            </p>
    
            <!-- Result Table -->
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Exam Date</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userDetails.created_at}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Math Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userDetails.maths_score}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Thinking Skills Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userDetails.thinking_skills_score}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Reading Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userDetails.reading_score}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Total Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userDetails.totalScore}</td>
              </tr>
            </table>
    
            <!-- Question Attempted Section -->
            <h3 style="color: #333;">Question Attempt Details</h3>
            <p style="color: #555; font-size: 14px;">
              Math:
              <ul>
                <li>Attempted: ${maths.attempted}</li>
                <li>Unattempted: ${maths.unattempted}</li>
              </ul>
              Thinking Skills:
              <ul>
                <li>Attempted: ${thinkingSkills.attempted}</li>
                <li>Unattempted: ${thinkingSkills.unattempted}</li>
              </ul>
              Reading:
              <ul>
                <li>Attempted: ${reading.attempted}</li>
                <li>Unattempted: ${reading.unattempted}</li>
              </ul>
            </p>
    
            <!-- Footer Section -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #aaa;">Thank you for using our service!</p>
            </div>
    
          </div>
        </body>
      </html>
    `;
    

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
      subject: 'Your Assessment Result Card',
      html: emailContent,  
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
