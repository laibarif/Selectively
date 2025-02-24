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

router.post("/submit", async (req, res) => {
  try {
    const { childId, category, testType, questionStatus, responses } = req.body;

    if (!childId || !category || !testType || !questionStatus || !responses) {
      console.log("❌ Missing required fields:", { childId, category, testType, questionStatus, responses });
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

    const { child_name, parent_email } = childData[0];

    // ✅ Calculate Attempted & Unattempted Questions
    const attempted = questionStatus.filter(q => q.status === "attempted").length;
    const unattempted = questionStatus.length - attempted;

    // ✅ Determine correct table for fetching answers
    const categoryTableMap = {
      maths: "original_maths",
      thinkingskills: "original_thinkingskillsquestion",
      reading: "original_readingquestion",
    };
    const tableName = categoryTableMap[category.toLowerCase()] || "original_maths"; // Default to maths

    // ✅ Fetch correct answers
    const questionIds = responses.map(ans => ans.questionId).filter(id => id);
    let correctAnswers = 0;
    let wrongAnswers = 0;

    if (questionIds.length > 0) {
      const [correctAnswersData] = await db.query(
        `SELECT id, correct_answer FROM ${tableName} WHERE id IN (${questionIds.map(() => '?').join(",")})`,
        questionIds
      );

      const correctAnswersMap = {};
      correctAnswersData.forEach(q => {
        correctAnswersMap[q.id] = q.correct_answer.trim().toLowerCase(); // Convert to lowercase for case-insensitive comparison
      });

      // ✅ Calculate correct & wrong answers
      responses.forEach(ans => {
        const submittedAnswer = ans.selectedAnswer.trim().toLowerCase();
        const correctAnswer = correctAnswersMap[ans.questionId];

        console.log(`🔍 Checking Question ID: ${ans.questionId}`);
        console.log(`User Answer: "${submittedAnswer}" | Correct Answer: "${correctAnswer}"`);

        if (correctAnswer) {
          // Compare only the first letter for MCQs
          if (submittedAnswer.charAt(0) === correctAnswer.charAt(0)) {
            correctAnswers++;
            console.log(`✅ Correct Answer for Question ID: ${ans.questionId}`);
          } else {
            wrongAnswers++;
            console.log(`❌ Wrong Answer for Question ID: ${ans.questionId}`);
          }
        }
      });
    }

    // ✅ Final Score Calculation
    const finalScore = correctAnswers;

    // ✅ Insert Test Result in DB
    await db.query(
      `INSERT INTO subject_test_results (child_id, category, test_type, score, question_status, responses)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [childId, category, testType, finalScore, JSON.stringify(questionStatus), JSON.stringify(responses)]
    );

    // ✅ Generate Email Report
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
              Dear Parent of ${child_name},<br><br>
              We are pleased to share the results of your child's recent assessment in <b>${category.toUpperCase()}</b>. Please find the details below:
            </p>

            <!-- Result Table -->
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Exam Date</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Category</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${category.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; font-weight: bold;">Score</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${finalScore}</td>
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

            <p style="color: #555; font-size: 16px;">
              If you have any questions about ${child_name}'s performance or need further guidance, please don't hesitate to contact us.
            </p>

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
      to: `${parent_email}`,
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