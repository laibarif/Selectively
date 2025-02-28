const express = require("express");
const db = require("../config/db");
const router = express.Router();
const OpenAI = require("openai");
const nodemailer = require("nodemailer");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const generateTestId = async (childId) => {
  const [lastTest] = await db.query(
    "SELECT MAX(test_id) AS lastTestId FROM practice_test_table WHERE childId = ?",
    [childId]
  );
  return lastTest[0]?.lastTestId ? lastTest[0].lastTestId + 1 : 1;
};

router.get("/getTestQuestions", async (req, res) => {
  try {
    // ✅ Fetch Reading Questions (5 Comprehension, 5 Vocabulary) & Join Extract Text
    const [readingQuestions] = await db.query(`
      (SELECT q.*, e.text AS extract_text 
       FROM original_readingquestion q 
       LEFT JOIN original_extract e ON q.extract_id = e.id
       WHERE q.type = "finalized" AND q.exam_type LIKE "%Practice%" AND q.category = "Comprehension" 
       ORDER BY RAND() LIMIT 5)
      UNION
      (SELECT q.*, e.text AS extract_text 
       FROM original_readingquestion q 
       LEFT JOIN original_extract e ON q.extract_id = e.id
       WHERE q.type = "finalized" AND q.exam_type LIKE "%Practice%" AND q.category = "Vocabulary" 
       ORDER BY RAND() LIMIT 5);
    `);

    // ✅ Fetch Math Questions (3 Fractions, 3 Percentage, 4 Ratio)
    const [mathQuestions] = await db.query(`
      (SELECT * FROM original_maths WHERE type = "finalized" AND exam_type LIKE "%Practice%" AND category = "Fraction" ORDER BY RAND() LIMIT 3)
      UNION
      (SELECT * FROM original_maths WHERE type = "finalized" AND exam_type LIKE "%Practice%" AND category = "Percentage" ORDER BY RAND() LIMIT 3)
      UNION
      (SELECT * FROM original_maths WHERE type = "finalized" AND exam_type LIKE "%Practice%" AND category = "Ratio" ORDER BY RAND() LIMIT 4);
    `);

    // ✅ Fetch Thinking Skills Questions (10 Random)
    const [thinkingSkillsQuestions] = await db.query(`
      SELECT * FROM original_thinkingskillsquestion 
      WHERE type = "finalized" AND exam_type LIKE "%Practice%" 
      ORDER BY RAND() LIMIT 10;
    `);

    // ✅ Fetch Writing Test (1 Topic)
    const [writingTopic] = await db.query(`
      SELECT * FROM original_writingquestion 
      WHERE type = "finalized" AND exam_type LIKE "%Practice%" 
      ORDER BY RAND() LIMIT 1;
    `);

    // ✅ Ensure all sections have questions
    if (!readingQuestions.length) {
      return res.status(404).json({ message: "Reading test questions are missing." });
    }
    if (!mathQuestions.length) {
      return res.status(404).json({ message: "Math test questions are missing." });
    }
    if (!writingTopic.length) {
      return res.status(404).json({ message: "writing test questions are missing." });
    }
    if (!thinkingSkillsQuestions.length) {
      return res.status(404).json({ message: "Thinking SKill test questions are missing." });
    }
    res.status(200).json({
      reading: readingQuestions,
      maths: mathQuestions,
      thinkingskills: thinkingSkillsQuestions,
      writing: writingTopic[0],
    });

  } catch (error) {
    console.error("Error fetching practice test questions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ✅ Function to evaluate writing response using GPT
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
      max_tokens: 150,
      temperature: 0.3,
    });

    let feedback = completion.choices[0].message.content.trim();
    const match = feedback.match(/Score[:\s]+(\d+(\.\d+)?)/);
    const score = match ? parseFloat(match[1]) : 0;

    return { score, feedback };
  } catch (error) {
    console.error("❌ GPT Error:", error);
    return { score: 0, feedback: "Error generating feedback." };
  }
}

router.post("/submitPracticeTest", async (req, res) => {
  try {
    console.log("Incoming Response:", req.body);

    const { childId, testType, sections } = req.body;

    // Validate request data
    if (!childId || !testType || !sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Generate a unique testId for this submission
    const testId = await generateTestId(childId);
    console.log("Generated Test ID:", testId);

    // Fetch child and parent details
    const [childData] = await db.query(`
      SELECT c.first_name AS child_name, u.email AS parent_email 
      FROM children c 
      JOIN users u ON c.parent_id = u.id 
      WHERE c.id = ?;
    `, [childId]);

    if (!childData.length) {
      return res.status(400).json({ message: "Child not found." });
    }

    const { child_name, parent_email } = childData[0];
    const sectionScores = { reading: 0, maths: 0, thinkingskills: 0, writing: 0 };
    let detailedFeedback = null;

    // Process each section
    for (const section of sections) {
      const { category, questionStatus, responses } = section;

      let finalScore = 0;

      // Calculate score based on category
      if (category === "writing") {
        // Writing Test Evaluation
        const writingResponse = responses[0]?.writingResponse?.trim() || "";
        if (!writingResponse) {
          return res.status(400).json({ message: "Writing response is empty." });
        }

        const question = "Given writing prompt"; // Fetch actual question if needed
        const { score, feedback } = await gradeWritingResponse(question, writingResponse);
        finalScore = score;
        detailedFeedback = feedback;
      } else {
        // MCQ Evaluation
        const categoryTableMap = {
          maths: "original_maths",
          thinkingskills: "original_thinkingskillsquestion",
          reading: "original_readingquestion",
        };
        const tableName = categoryTableMap[category];

        const questionIds = responses.map(ans => ans.questionId);
        const [correctAnswersData] = await db.query(
          `SELECT id, correct_answer FROM ${tableName} WHERE id IN (${questionIds.map(() => '?').join(",")})`,
          questionIds
        );

        console.log("Correct Answers Data:", correctAnswersData);

        const correctAnswersMap = Object.fromEntries(
          correctAnswersData.map(q => [q.id, q.correct_answer.trim().toLowerCase()])
        );

        console.log("Correct Answers Map:", correctAnswersMap);
        console.log("User Responses:", responses);

        // Calculate the number of correct answers
        finalScore = responses.reduce((score, ans) => {
          if (!ans.selectedAnswer) return score; // Skip unanswered questions
        
          const userAnswer = ans.selectedAnswer.trim().charAt(0).toLowerCase(); // Take first character only
          const correctAnswer = (correctAnswersMap[ans.questionId] || "").trim().charAt(0).toLowerCase();
        
          console.log(`QID: ${ans.questionId}, User: "${userAnswer}", Correct: "${correctAnswer}"`);
        
          return userAnswer === correctAnswer ? score + 1 : score;
        }, 0);
        
      }

      // Update sectionScores with the number of correct answers
      sectionScores[category] = finalScore;

      // Store individual subject score in `subject_test_results`
      await db.query(`
        INSERT INTO subject_test_results (child_id, category, test_type, score, question_status, responses, feedback, test_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          score = VALUES(score), 
          question_status = VALUES(question_status), 
          responses = VALUES(responses), 
          feedback = VALUES(feedback);
      `, [
        childId, category, testType, finalScore,
        JSON.stringify(questionStatus), JSON.stringify(responses),
        detailedFeedback, testId
      ]);
    }

    // Calculate max scores dynamically based on the number of questions
    const maxScores = {
      reading: sections.find(s => s.category === "reading")?.responses.length || 10,
      maths: sections.find(s => s.category === "maths")?.responses.length || 10,
      thinkingskills: sections.find(s => s.category === "thinkingskills")?.responses.length || 10,
      writing: 10, // Writing is graded out of 10
    };

    // Normalize scores and calculate final score
    const finalScore = (
      (sectionScores.reading / maxScores.reading) * 25 +
      (sectionScores.maths / maxScores.maths) * 25 +
      (sectionScores.thinkingskills / maxScores.thinkingskills) * 25 +
      (sectionScores.writing / maxScores.writing) * 25
    );

    console.log("Final Scores Before Insertion:", {
      testId,
      Reading: sectionScores.reading,
      Maths: sectionScores.maths,
      ThinkingSkills: sectionScores.thinkingskills,
      Writing: sectionScores.writing,
      FinalScore: finalScore
    });

    // Store final score in `practice_test_table`
    await db.query(`
      INSERT INTO practice_test_table 
      (childId, test_id, reading_score, maths_score, thinking_skills_score, writing_score, final_score, feedback) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        reading_score = VALUES(reading_score), 
        maths_score = VALUES(maths_score),
        thinking_skills_score = VALUES(thinking_skills_score),
        writing_score = VALUES(writing_score),
        final_score = VALUES(final_score),
        feedback = VALUES(feedback);
    `, [
      childId, testId,
      sectionScores.reading, sectionScores.maths, sectionScores.thinkingskills, sectionScores.writing,
      finalScore, "Final feedback"
    ]);

    res.status(200).json({ message: `Test submitted successfully for Test ${testId}.`, finalScore });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;