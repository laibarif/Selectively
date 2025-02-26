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

module.exports = router;