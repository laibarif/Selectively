const express = require("express");
const db = require("../config/db");
const router = express.Router();
const nodemailer = require("nodemailer");
const path = require("path");

router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Mapping categories to their respective database tables
    const categoryTableMap = {
      maths: "original_maths",
      thinkingskills: "original_thinkingskillsquestion",
      reading: "original_readingquestion",
      writing: "original_writingquestion",
    };

    const tableName = categoryTableMap[category];

    if (!tableName) {
      return res.status(400).json({ message: "Invalid category." });
    }

    let query;
    if (category === "reading") {
      // Query for reading questions with extract text
      query = `
        SELECT q.*, e.text
        FROM original_readingquestion q
        LEFT JOIN original_extract e ON q.extract_id = e.id
        WHERE q.type = "finalized"
        ORDER BY RAND()
        LIMIT 35;
      `;
    } else {
      // Query for other subjects
      query = `
        SELECT * 
        FROM ${tableName} 
        WHERE type = "finalized"
        ORDER BY RAND()
        LIMIT 35;
      `;
    }

    const [questions] = await db.query(query);

    if (!questions.length) {
      return res.status(404).json({ message: "No questions found for this category." });
    } else {
      console.log("Questions fetched:", questions);
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching subject test questions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Your Hostinger email
    pass: process.env.EMAIL_PASSWORD // Your Hostinger password
  }
});

// ✅ Submit Test & Send Report Email
router.post("/submit", async (req, res) => {
  try {
    console.log("Received data from frontend:", JSON.stringify(req.body, null, 2));
    const { childId, category, testType, score, questionStatus, responses } = req.body;
    console.log("Extracted Values:", { childId, category, testType, score, questionStatus, responses });

    if (!childId || !category || !testType || !questionStatus || !responses) {
      console.log("❌ Missing required fields:", { childId, category, testType, score, questionStatus, responses });
      return res.status(400).json({ message: "Invalid request data" });
    }

    // ✅ Fetch Child & Parent Emails
    const [childData] = await db.query(`
      SELECT c.first_name AS child_name, u.email AS parent_email 
      FROM children c 
      JOIN users u ON c.parent_id = u.id 
      WHERE c.id = ?;
    `, [childId]);

    if (childData.length === 0) {
      return res.status(400).json({ message: "Child not found." });
    }

    const { child_name, child_email, parent_email } = childData[0];

    // ✅ Insert Test Result in DB
    const query = `
      INSERT INTO subject_test_results (child_id, category, test_type, score, question_status, responses)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    await db.query(query, [
      childId,
      category,
      testType,
      score,
      JSON.stringify(questionStatus),
      JSON.stringify(responses)
    ]);

    // ✅ Calculate Attempted & Correct Answers
    const attempted = questionStatus.filter(q => q.status === "attempted").length;
    const unattempted = questionStatus.length - attempted;
    const correctAnswers = responses.filter(ans => ans.correct === true).length;
    const wrongAnswers = attempted - correctAnswers;

    // ✅ Generate Formatted HTML Report
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            
            <!-- Logo Section -->
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo@unique.id" alt="School Logo" style="width: 150px;">
            </div>
    
            <!-- Heading Section -->
            <h2 style="text-align: center; color: #333;">Your Assessment Result</h2>
            
            <!-- User Information -->
            <p style="color: #555; font-size: 16px;">
              Dear ${child_name},<br><br>
              We are pleased to share the results of your recent assessment in <b>${category}</b>. Please find the details below:
            </p>
    
            <!-- Result Table -->
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Exam Date</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Category</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${category}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${score}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Attempted Questions</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${attempted}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Unattempted Questions</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${unattempted}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Correct Answers</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${correctAnswers}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Wrong Answers</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${wrongAnswers}</td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 20px;">
              <a href="https://selectiveexam.com.au/signup" style="text-decoration: none;">
                <div style="background-color: #fbbf24; padding: 10px 20px; border-radius: 5px; display: inline-block; color: #fff; font-weight: bold;">Sign up</div>
              </a>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #aaa;">Thank you for using our service!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Send Email to Child & Parent
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${child_email}, ${parent_email}`,
      subject: `Exam Report: ${category} - ${child_name}`,
      html: emailContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../assests/Logo_White-Complete.jpg"),
          cid: "logo@unique.id"
        }
      ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Test submitted, but email failed to send." });
      }
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Test submitted successfully, and report sent via email!" });
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;