const express = require("express");
const db = require("../config/db");
const router = express.Router();

// ✅ Route to fetch all practice test questions
router.get("/practice-test", async (req, res) => {
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
    if (!readingQuestions.length ) {
      return res.status(404).json({ message: "Reading test questions are missing." });
    }
    if (!mathQuestions.length ) {
      return res.status(404).json({ message: "Math test questions are missing." });
    }
    if (!writingTopic.length) {
      return res.status(404).json({ message: "writing test questions are missing." });
    }
    if (!thinkingSkillsQuestions.length ) {
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

router.post("/get-correct-answers", async (req, res) => {
  try {
      const { questionIds } = req.body;
      const [rows] = await db.query(
          `SELECT id, correct_answer FROM original_questions WHERE id IN (${questionIds.map(() => '?').join(",")})`,
          questionIds
      );

      const correctAnswers = {};
      rows.forEach(row => {
          correctAnswers[row.id] = row.correct_answer.trim().toLowerCase();
      });

      res.json({ correctAnswers });
  } catch (error) {
      console.error("Error fetching correct answers:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/evaluate-writing", async (req, res) => {
  try {
      const { question, response } = req.body;

      const prompt = `
      You are a high school writing examiner. Evaluate the response based on:
      - Relevance to topic
      - Following instructions
      - Creativity
      - Grammar & Clarity
      - Vocabulary

      Score from **0-10**. If relevance is "Not Followed", set score to **0**.

      **Output Format:**
      Score: X/10
      - ✅ Relevance: Followed / Not Followed
      - ✅ Instructions: Followed / Not Followed
      - ✅ Creativity: Followed / Not Followed
      - ✅ Grammar & Clarity: Followed / Not Followed
      - ✅ Vocabulary: Followed / Not Followed

      **Now evaluate this response:**
      **Question:** "${question}"
      **Student's Response:** "${response}"
      `;

      const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 150,
          temperature: 0.3,
      });

      const feedback = completion.choices[0].message.content.trim();
      const match = feedback.match(/Score[:\s]+(\d+(\.\d+)?)/);
      const score = match ? parseFloat(match[1]) : 0;

      res.json({ score, feedback });
  } catch (error) {
      console.error("Error evaluating writing:", error);
      res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;