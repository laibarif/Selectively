const express = require("express");
const db = require("../config/db");
const router = express.Router();

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

// ✅ POST: Submit subject test answers (Unlimited attempts per day)
router.post("/submit", async (req, res) => {
  try {
    const { email, category, responses } = req.body;

    if (!email || !category || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const query = `
      INSERT INTO subject_test_results (email, category, question_id, selected_answer) 
      VALUES ?;
    `;

    const values = responses.map((response) => [
      email,
      category,
      response.questionId,
      response.selectedAnswer,
    ]);

    await db.query(query, [values]);

    res.status(200).json({ message: "Test submitted successfully!" });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
