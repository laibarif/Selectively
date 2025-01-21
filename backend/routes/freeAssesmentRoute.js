const express = require("express");
const db = require("../config/db.js");
const nodemailer = require("nodemailer");
const router = express.Router();
const path = require("path");
const he = require("he");

const WHITELISTED_EMAILS = ["awaisnaeem962@gmail.com", "kamini.soni.74@gmail.com", "rsaini77@gmail.com", "adeelnaeem2588@gmail.com", "laibaslatch@gmail.com"]; // Add emails that can perform multiple assessments

router.post("/userdetailforassesment", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM userdetailforassesment WHERE email = ?",
      [email]
    );

    const existingUser = rows[0];

    // Check if the email is in the whitelist
    const isWhitelisted = WHITELISTED_EMAILS.includes(email);

    // If the email is not whitelisted, enforce the original conditions
    if (!isWhitelisted) {
      if (existingUser && existingUser.is_assessed === 1) {
        return res
          .status(400)
          .json({ message: "Email already exists. Free trial used." });
      }

      if (existingUser && existingUser.is_assessed === 0) {
        await db.query(
          "UPDATE userdetailforassesment SET is_assessed = true WHERE email = ?",
          [email]
        );
        return res
          .status(200)
          .json({ message: "User details updated for assessment." });
      }
    }

    // If the email is whitelisted or not previously existing, allow multiple assessments
    await db.query(
      "INSERT INTO userdetailforassesment (email, is_assessed) VALUES (?, false) ON DUPLICATE KEY UPDATE is_assessed = false",
      [email]
    );

    res.status(201).json({
      message: isWhitelisted
        ? "Assessment allowed for whitelisted email."
        : "User details added for assessment.",
    });
  } catch (error) {
    console.error("Error in /userdetailforassesment route:", error);
    res.status(500).json({ message: "Server error." });
  }
});


router.get("/randomMathsQuestions", async (req, res) => {
  try {
    // Fetch all finalized questions, including those without images
    const [questions] = await db.query(
      `(
    SELECT 
        q.*, 
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_data
            ELSE q.image_data 
        END AS image_data,
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_description
            ELSE q.image_description 
        END AS image_description
    FROM 
        selectively_mathsquestion q
    LEFT JOIN 
        selectively_mathsquestion p ON q.parent_question_id = p.id
    WHERE 
        q.type = "finalized" AND q.level = "easy"
    LIMIT 3
)
UNION ALL
(
    SELECT 
        q.*, 
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_data
            ELSE q.image_data 
        END AS image_data,
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_description
            ELSE q.image_description 
        END AS image_description
    FROM 
        selectively_mathsquestion q
    LEFT JOIN 
        selectively_mathsquestion p ON q.parent_question_id = p.id
    WHERE 
        q.type = "finalized" AND q.level = "medium"
    LIMIT 3
)
UNION ALL
(
    SELECT 
        q.*, 
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_data
            ELSE q.image_data 
        END AS image_data,
        CASE 
            WHEN q.parent_question_id IS NOT NULL THEN p.image_description
            ELSE q.image_description 
        END AS image_description
    FROM 
        selectively_mathsquestion q
    LEFT JOIN 
        selectively_mathsquestion p ON q.parent_question_id = p.id
    WHERE 
        q.type = "finalized" AND q.level = "Difficult"
    LIMIT 4
)
ORDER BY RAND();

`
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found." });
    }

    questions.image_data = questions.image_data
      ? Buffer.from(questions.image_data).toString("base64")
      : null;

    const removeTrailingCommas = (mcq_options) => {
      // Split the options into an array based on commas or newlines
      let options = mcq_options.split(/,|\n/); // Splits on commas or newlines

      // Trim each option and remove trailing commas
      options = options.map(option => option.trim().replace(/,$/, ""));

      // Join the options back into a string with newlines or commas if needed
      return options.join("\n"); // Adjust to use "," or "\n" as per your needs
    };

    // Sanitize the extract_text field
    questions.forEach((question) => {
      question.mcq_options = removeTrailingCommas(question.mcq_options);
    });

    // Send the questions to the frontend
    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error in /randomMathsQuestions route:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/randomThinkingskillQuestions", async (req, res) => {
  try {
    const [questions] = await db.query(
      `(
    SELECT * 
    FROM selectively_thinkingskillsquestion
    WHERE 
        type = "finalized" 
        AND question IS NOT NULL 
        AND question != "" 
        AND mcq_options IS NOT NULL 
        AND level = "easy"
    ORDER BY RAND()
    LIMIT 2
)
UNION ALL
(
    SELECT * 
    FROM selectively_thinkingskillsquestion
    WHERE 
        type = "finalized" 
        AND question IS NOT NULL 
        AND question != "" 
        AND mcq_options IS NOT NULL 
        AND level = "medium"
    ORDER BY RAND()
    LIMIT 5
)
UNION ALL
(
    SELECT * 
    FROM selectively_thinkingskillsquestion
    WHERE 
        type = "finalized" 
        AND question IS NOT NULL 
        AND question != "" 
        AND mcq_options IS NOT NULL 
        AND level = "difficult"
    ORDER BY RAND()
    LIMIT 3
)
ORDER BY RAND();
`
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found." });
    }

    const removeTrailingCommas = (mcq_options) => {
      // Split the options into an array based on commas or newlines
      let options = mcq_options.split(/,|\n/); // Splits on commas or newlines

      // Trim each option and remove trailing commas
      options = options.map(option => option.trim().replace(/,$/, ""));

      // Join the options back into a string with newlines or commas if needed
      return options.join("\n"); // Adjust to use "," or "\n" as per your needs
    };

    // Sanitize the extract_text field
    questions.forEach((question) => {
      question.mcq_options = removeTrailingCommas(question.mcq_options);
    });

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching thinking skills questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// router.get("/randomReadingQuestions", async (req, res) => {
//   try {
//     // Execute the query to fetch random reading questions along with the corresponding text from the extract table
//     const [questions] = await db.query(
//       `(
//     SELECT 
//         r.id AS question_id, 
//         r.question, 
//         r.mcq_options, 
//         r.correct_answer, 
//         r.explanation, 
//         r.subject, 
//         r.type, 
//         e.text AS extract_text 
//     FROM 
//         selectively_readingquestion r
//     JOIN 
//         selectively_extract e 
//     ON 
//         r.extract_id = e.id
//     WHERE 
//         r.type = "finalized" 
//         AND r.question IS NOT NULL 
//         AND r.question != "" 
//         AND r.mcq_options IS NOT NULL 
//         AND r.level = "easy"
//     ORDER BY 
//         RAND()
//     LIMIT 3
// )
// UNION ALL
// (
//     SELECT 
//         r.id AS question_id, 
//         r.question, 
//         r.mcq_options, 
//         r.correct_answer, 
//         r.explanation, 
//         r.subject, 
//         r.type, 
//         e.text AS extract_text 
//     FROM 
//         selectively_readingquestion r
//     JOIN 
//         selectively_extract e 
//     ON 
//         r.extract_id = e.id
//     WHERE 
//         r.type = "finalized" 
//         AND r.question IS NOT NULL 
//         AND r.question != "" 
//         AND r.mcq_options IS NOT NULL 
//         AND r.level = "medium"
//     ORDER BY 
//         RAND()
//     LIMIT 4
// )
// UNION ALL
// (
//     SELECT 
//         r.id AS question_id, 
//         r.question, 
//         r.mcq_options, 
//         r.correct_answer, 
//         r.explanation, 
//         r.subject, 
//         r.type, 
//         e.text AS extract_text 
//     FROM 
//         selectively_readingquestion r
//     JOIN 
//         selectively_extract e 
//     ON 
//         r.extract_id = e.id
//     WHERE 
//         r.type = "finalized" 
//         AND r.question IS NOT NULL 
//         AND r.question != "" 
//         AND r.mcq_options IS NOT NULL 
//         AND r.level = "difficult"
//     ORDER BY 
//         RAND()
//     LIMIT 3
// )
// ORDER BY RAND();

// `
//     );

//     // Check if no questions were found
//     if (questions.length === 0) {
//       return res.status(404).json({ message: "No questions found." });
//     }

//     const removeTrailingCommas = (mcq_options) => {
//       // Split the options into an array based on commas or newlines
//       let options = mcq_options.split(/,|\n/); // Splits on commas or newlines

//       // Trim each option and remove trailing commas
//       options = options.map(option => option.trim().replace(/,$/, ""));

//       // Join the options back into a string with newlines or commas if needed
//       return options.join("\n"); // Adjust to use "," or "\n" as per your needs
//     };

//     // Sanitize the extract_text field
//     questions.forEach((question) => {
//       question.mcq_options = removeTrailingCommas(question.mcq_options);
//     });


//     // Send the fetched questions as a JSON response
//     res.status(200).json({ questions });
//   } catch (error) {
//     // Log and handle any errors that occur
//     console.error("Error fetching reading questions:", error);
//     res.status(500).json({ message: "Server error." });
//   }
// });


router.get("/randomReadingQuestions", async (req, res) => {
  try {
    const [questions] = await db.query(`
      SELECT 
          r.id AS question_id, 
          r.question, 
          r.mcq_options, 
          r.correct_answer, 
          r.explanation, 
          r.subject, 
          r.type, 
          e.text AS extract_text, 
          r.extract_id
      FROM 
          selectively_readingquestion r
      JOIN 
          selectively_extract e 
      ON 
          r.extract_id = e.id
      WHERE 
          r.type = "finalized" 
          AND r.question IS NOT NULL 
          AND r.question != "" 
          AND r.mcq_options IS NOT NULL 
          AND r.level IN ("easy", "medium", "difficult")
      ORDER BY 
          RAND()
    `);

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found." });
    }

    const removeTrailingCommas = (mcq_options) => {
      let options = mcq_options.split(/,|\n/).map(option => option.trim().replace(/,$/, ""));
      return options.join("\n");
    };

    // Sanitize mcq_options
    questions.forEach((question) => {
      question.mcq_options = removeTrailingCommas(question.mcq_options);
    });

    // Group questions by extract_id
    const groupedQuestions = questions.reduce((acc, question) => {
      if (!acc[question.extract_id]) {
        acc[question.extract_id] = [];
      }
      acc[question.extract_id].push(question);
      return acc;
    }, {});

    // Convert grouped object to an array and shuffle the groups
    const shuffledGroups = Object.values(groupedQuestions).sort(() => Math.random() - 0.5);

    // Flatten the shuffled groups into a single array while maintaining group sequence
    const orderedQuestions = shuffledGroups.flat();

    res.status(200).json({ questions: orderedQuestions });

  } catch (error) {
    console.error("Error fetching reading questions:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/submitMathsAssessment", async (req, res) => {
  const { email, score, questionStatus } = req.body;

  // Ensure email, score, and questionStatus are provided
  if (!email || score === undefined || !questionStatus) {
    return res
      .status(400)
      .json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE userdetailforassesment
      SET maths_score = ?, maths_question_status = ?
      WHERE LOWER(email) = LOWER(?)
    `;

    // Execute the query using db.query (no need for .promise())
    const [result] = await db.query(query, [
      score,
      JSON.stringify(questionStatus),
      email
    ]);

    // Check if the update was successful (affected rows should be > 0)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    // Respond with a success message
    res
      .status(200)
      .json({
        message:
          "Maths assessment score and question status updated successfully."
      });
  } catch (error) {
    console.error("Error updating maths assessment:", error);
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/submitThinkingSkillsAssessment", async (req, res) => {
  const { email, score, questionStatus } = req.body;

  if (!email || score === undefined || !questionStatus) {
    return res
      .status(400)
      .json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE userdetailforassesment
      SET thinking_skills_score = ?, thinking_skills_question_status = ?
      WHERE LOWER(email) = LOWER(?)
    `;

    // Execute the query using db.query (no need for .promise())
    const [result] = await db.query(query, [
      score,
      JSON.stringify(questionStatus),
      email
    ]);

    // Check if the update was successful (affected rows should be > 0)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    res.status(200).json({
      message:
        "Thinking skills assessment score and question status updated successfully."
    });
  } catch (error) {
    console.error(
      "Error updating thinking skills score and question status:",
      error
    );
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/randomReadingQuestions", async (req, res) => {
  const { email, score, questionStatus } = req.body;

  if (!email || score === undefined || !questionStatus) {
    return res
      .status(400)
      .json({ message: "Email, score, and questionStatus are required." });
  }

  try {
    const query = `
      UPDATE userdetailforassesment
      SET reading_score = ?, reading_question_status = ?
      WHERE LOWER(email) = LOWER(?)
    `;

    // Execute the query using db.query (no need for .promise())
    const [result] = await db.query(query, [
      score,
      JSON.stringify(questionStatus),
      email
    ]);

    // Check if the update was successful (affected rows should be > 0)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    res.status(200).json({
      message:
        "Reading assessment score and question status updated successfully."
    });
  } catch (error) {
    console.error("Error updating reading score and question status:", error);
    res.status(500).json({ message: "Server error." });
  }
});

async function checkTestScore(email, scoreColumn) {
  try {
    const query = `SELECT ${scoreColumn} FROM serdetailforassesment WHERE email = ?`;
    const [result] = await db.promise().query(query, [email]);
    if (result.length === 0) {
      return { error: "User not found." };
    }
    const score = result[0][scoreColumn];
    const isIncomplete = score === null;
    return {
      incomplete: isIncomplete,
      message: isIncomplete
        ? `The test for ${scoreColumn.replace("_", " ")} is incomplete.`
        : `The test for ${scoreColumn.replace("_", " ")} is already completed.`
    };
  } catch (error) {
    console.error(
      `Error checking ${scoreColumn} score for email ${email}:`,
      error
    );
    throw new Error("Database query failed.");
  }
}

router.post("/checkReadingTestAlreadyConduct", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
      SELECT reading_score
      FROM userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    // Directly use the db instance to query
    const [result] = await db.query(query, [email]);

    // Check if the result is empty (no user found)
    if (result.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    const { reading_score } = result[0];

    // Check if the reading score is already set
    if (reading_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false
      });
    }

    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true
    });
  } catch (error) {
    console.error("Error in /checkReadingTestAlreadyConduct route:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to check math test
router.post("/checkMathTestAlreadyConduct", async (req, res) => {
  const { email } = req.body;

  // Validate input parameters
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
      SELECT maths_score
      FROM userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    // Execute the query and destructure the result
    const [result] = await db.query(query, [email]);

    // Check if the result is empty or no user was found
    if (!result || result.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    const { maths_score } = result[0];

    // Check if the maths_score is already set (i.e., test already conducted)
    if (maths_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false
      });
    }

    // If the test is incomplete, return a message to proceed with the test
    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error checking math test:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Route to check thinking skills test
router.post("/checkThinkingSkillsTestAlreadyConduct", async (req, res) => {
  const { email } = req.body;

  // Validate email input
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const query = `
      SELECT thinking_skills_score
      FROM userdetailforassesment 
      WHERE LOWER(email) = LOWER(?)
    `;

    // Execute the query
    const [result] = await db.query(query, [email]);

    // Check if the result is empty (user not found)
    if (!result || result.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }

    const { thinking_skills_score } = result[0];

    // Check if the thinking_skills_score is already set (test already conducted)
    if (thinking_skills_score !== null) {
      return res.status(400).json({
        message: "Test has already been conducted before.",
        navigate: false // Custom key to indicate no navigation
      });
    }

    // If the test is incomplete, prompt to proceed with the test
    return res.status(200).json({
      message: "Test is incomplete. Please proceed with the test.",
      navigate: true // Custom key to allow navigation
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error checking thinking skills test:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Function to check if it's a string and parse it
const safeParse = (data) => {
  try {
    // Check if the data is a string and then parse it
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return []; // Return an empty array if parsing fails
  }
};

// Route to send user details via email
router.post("/send-user-details", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Get a connection from the pool
    const connection = await db.getConnection();

    // Query the database to find the user details by email
    const [results] = await connection.query(
      "SELECT * FROM userdetailforassesment WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found in the table." });
    }

    const userDetails = results[0];

    // Safely parse the JSON fields from the database (handle any malformed JSON)
    const mathsQuestionStatus = safeParse(userDetails.maths_question_status);
    const thinkingSkillsQuestionStatus = safeParse(
      userDetails.thinking_skills_question_status
    );
    const readingQuestionStatus = safeParse(
      userDetails.reading_question_status
    );

    if (
      !mathsQuestionStatus ||
      mathsQuestionStatus.length === 0 ||
      !thinkingSkillsQuestionStatus ||
      thinkingSkillsQuestionStatus.length === 0 ||
      !readingQuestionStatus ||
      readingQuestionStatus.length === 0
    ) {
      return res.status(400).json({
        message: "Please complete 3 books tests before submitting."
      });
    }

    // Function to count attempted and unattempted questions
    const countAttempts = (questionStatus) => {
      const attempted = questionStatus.filter(
        (item) => item.status === "attempted"
      ).length;
      const unattempted = questionStatus.filter(
        (item) => item.status !== "attempted"
      ).length;
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

    // Email content HTML template
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
              Dear student<br><br>
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
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Your Hostinger email password
      }
    });
  
    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Assessment Result Card",
      html: emailContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../assests/Logo_White-Complete.jpg"),
          cid: "logo@unique.id"
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    await connection.query(
      `UPDATE userdetailforassesment 
       SET 
         is_assessed = 1, 
         maths_score = NULL, 
         thinking_skills_score = NULL, 
         reading_score = NULL, 
         maths_question_status = NULL, 
         thinking_skills_question_status = NULL, 
         reading_question_status = NULL
       WHERE email = ?`,
      [email]
    );

    // Release the connection back to the pool
    connection.release();

    // Send the success response
    res.status(200).json({
      message:
        "Assessment details sent successfully via email, and is_assessed updated to 1."
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

// Helper function to safely parse JSON
const parseJsonSafe = (data) => {
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("JSON parsing error:", error);
    return []; // Return an empty array or appropriate default value
  }
};

router.get("/userAssessmentDetails", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM userdetailforassesment WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0];

    // Function to calculate question statistics from JSON status
    const calculateQuestionStats = (questionStatus) => {
      let totalUnattempted = 0;
      let totalAttempted = 0;
      let totalCorrect = 0;
      let totalWrong = 0;

      // Safely parse the questionStatus and calculate statistics
      if (questionStatus && Array.isArray(questionStatus)) {
        questionStatus.forEach((question) => {
          if (question.status === "correct") {
            totalCorrect += 1;
          } else if (question.status === "wrong") {
            totalWrong += 1;
          } else if (question.status === "attempted") {
            totalAttempted += 1;
          } else {
            totalUnattempted += 1;
          }
        });

        // Total attempted questions is the sum of correct, wrong, and attempted questions
        totalAttempted += totalCorrect + totalWrong;
      }

      return {
        totalUnattempted,
        totalAttempted, // Including correct and wrong in attempted count
        totalCorrect,
        totalWrong
      };
    };

    // Safely parse and calculate statistics for each section
    const mathsStats = calculateQuestionStats(
      parseJsonSafe(user.maths_question_status)
    );
    const thinkingSkillsStats = calculateQuestionStats(
      parseJsonSafe(user.thinking_skills_question_status)
    );
    const readingStats = calculateQuestionStats(
      parseJsonSafe(user.reading_question_status)
    );

    // Send response with calculated statistics
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        maths_score: user.maths_score,
        thinking_skills_score: user.thinking_skills_score,
        reading_score: user.reading_score
      },
      mathsStats,
      thinkingSkillsStats,
      readingStats
    });
  } catch (error) {
    console.error("Error in /userAssessmentDetails route:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
