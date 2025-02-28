const express = require("express");
const db = require("../config/db");
const router = express.Router();
const nodemailer = require("nodemailer");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const generateTestId = async (childId) => {
  const [lastTest] = await db.query(
    "SELECT MAX(test_id) AS lastTestId FROM practice_test_table WHERE childId = ?",
    [childId]
  );
  return lastTest[0]?.lastTestId ? lastTest[0].lastTestId + 1 : 1;
};
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
    } else if (category === "writing") {
      query = `
          SELECT * 
          FROM ${tableName} 
          WHERE type = "finalized"
          ORDER BY RAND()
          LIMIT 1;
      `;
    } else {
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

async function gradeWritingResponse(question, response) {
  try {
    const prompt = `
      You are a strict high school writing examiner. Evaluate the response based on the given instructions.

      **Evaluation Criteria:**
      - Relevance: Does the response address the topic? (Strictly Check)
        Make sure If not relavant assign 0 score directly
      - Following Instructions: Does the response follow all given instructions?
      - Creativity: Does the response show originality and effectiveness?
      - Grammar & Clarity: Is the response grammatically correct and easy to understand?
      - Vocabulary: Is the vocabulary rich and appropriate?

      **Scoring Instructions:**
      - Assign a score from **0 to 10** based on these factors.
      - If the response is off-topic, has poor grammar, or does not follow instructions, **score should be lower**.
      - Clearly state which **instructions were followed** and which were **not followed**.

      **Output Format (Strictly Follow This):**
      Score:
      - ✅ Relevance: [Followed / Not Followed]
      - ✅ Key details: [Followed / Not Followed]
      - ✅ Creativity: [Followed / Not Followed]
      - ✅ Grammar & Clarity: [Followed / Not Followed]
      - ✅ Vocabulary: [Followed / Not Followed]

      **Example Output:**
      Score:
      - ✅ Relevance: Followed
      - ❌ Key details: Not Followed (Missed key detail)
      - ✅ Creativity: Followed
      - ✅ Grammar & Clarity: Followed
      - ❌ Vocabulary: Not Followed (Limited range)

      **Now, evaluate the following response:**
      **Question:** "${question}"
      **Student's Response:** "${response}"
      `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 150, // ✅ Limits response length
      temperature: 0.3,
    });

    let feedback = completion.choices[0].message.content.trim();
    // feedback = feedback.replace(/[^a-zA-Z0-9.,\s\-/]/g, ""); // ✅ Remove special characters
    feedback = feedback.replace(/\s+/g, " ").trim(); // ✅ Remove extra spaces

    console.log("📝 GPT Feedback (Cleaned):", feedback);

    return feedback;
  } catch (error) {
    console.error("❌ GPT Error:", error);
    return "Error generating feedback.";
  }
}


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
    const testId = await generateTestId(childId);
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
    let finalScore = 0;
    let attempted = 0;
    let unattempted = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;

    if (category === "writing") {
      // ✅ Auto-Grade Writing Response
      let writingResponse = "";


      if (responses && typeof responses === "object") {
        // If responses is an object, check for the writing property
        writingResponse = responses.writing || "";
      } else if (Array.isArray(responses)) {
        // If responses is an array, find the writing response
        writingResponse = responses.find((r) => r.writing)?.writing || "";
      } else {
        console.log("❌ Unexpected responses format:", responses);
      }
      const question = "Given writing prompt"; // Ideally, fetch the actual prompt

      if (writingResponse.trim() === "") {
        detailedFeedback = "No response provided.";
      } else {
        detailedFeedback = await gradeWritingResponse(question, writingResponse);
        const match = detailedFeedback.match(/Score[:\s]+(\d+(\.\d+)?)/);
        finalScore = match ? parseFloat(match[1]) : 0;
        detailedFeedback = detailedFeedback.replace(/Score[:\s]+\d+(\.\d+)?/, "").trim(); 
      }
    }
    else { // ✅ Calculate Attempted & Unattempted Questions
      attempted = questionStatus.filter(q => q.status === "attempted").length;
      unattempted = questionStatus.length - attempted;

      // ✅ Determine correct table for fetching answers
      const categoryTableMap = {
        maths: "original_maths",
        thinkingskills: "original_thinkingskillsquestion",
        reading: "original_readingquestion",
      };
      const tableName = categoryTableMap[category.toLowerCase()] || "original_maths"; // Default to maths

      // ✅ Fetch correct answers
      const questionIds = responses.map(ans => ans.questionId).filter(id => id);
      

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
      finalScore = correctAnswers;
    }


    // ✅ Insert Test Result in DB
    const feedbackToStore = category === "writing" ? detailedFeedback : null; // ✅ Store feedback only for writing

    await db.query(
      `INSERT INTO subject_test_results (child_id, category, test_type, score, question_status, responses, feedback,test_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [childId, category, testType, finalScore, JSON.stringify(questionStatus), JSON.stringify(responses), feedbackToStore,testId]
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
          

          <!-- Writing Test: Include AI Feedback -->
          ${category === "writing"
        ? `
           <p style="font-size: 16px; font-weight: bold;">AI Feedback:</p>
          <ul>
            ${feedbackToStore.split("\n").map(line => `<li>${line}</li>`).join("")}
          </ul>`
        : `
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
          </table>`}

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
      to: `${parent_email} `,
      subject: `Exam Report: ${category} - ${child_name} `,
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

  }
  catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;