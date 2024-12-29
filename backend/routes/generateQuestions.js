const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateRelatedQuestions(originalQuestionId, subject) {
  let tableName;

  console.log('originalQuestionId:', originalQuestionId);
  console.log('subject:', subject);

  // Step 1: Determine the table name
  switch (subject) {
    case 'Maths':
      tableName = 'selectively_mathsquestion';
      break;
    case 'ThinkingSkills':
      tableName = 'selectively_thinkingskillsquestion';
      break;
    case 'Writing':
      tableName = 'selectively_writingquestion';
      break;
    case 'Reading':
      tableName = 'selectively_readingquestion';
      break;
    default:
      console.log('Invalid subject:', subject);
      throw new Error('Invalid subject for question generation');
  }

  try {
    console.log("Entering try block...");
    console.log('Table name:', tableName);

    // Step 2: Fetch parent question details
    const [rows] = await db.query(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [originalQuestionId]
    );

    console.log('Database Query Rows:', rows);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.error('No data found for the given question ID.');
      throw new Error('Parent question not found in the database.');
    }

    const parentQuestion = rows[0];
    console.log('Parent Question Retrieved:', parentQuestion);

    // Step 3: Build prompt for GPT
    const prompt = `
      Generate exactly 5 unique and creative ${subject} questions based on this parent question.
      Each question must include:

      Question: <question text>
      Options: A) <option 1>, B) <option 2>, C) <option 3>, D) <option 4>
      Correct Answer: <correct option>
      Explanation: <explanation>

      Separate each question with '---'.

      Parent Question: ${parentQuestion.question}
      Options: ${parentQuestion.mcq_options || ''}
      Correct Answer: ${parentQuestion.correct_answer || ''}
      Explanation: ${parentQuestion.explanation || ''}
    `;

    console.log('Prompt Sent to GPT:', prompt);

    // Step 4: Call GPT API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    console.log('Full GPT API Response:', JSON.stringify(response.data, null, 2));

    // Step 5: Validate GPT response
    const assistantResponse = response?.data?.choices?.[0]?.message?.content;

    if (!assistantResponse || typeof assistantResponse !== 'string') {
      console.error('Invalid GPT Response:', assistantResponse);
      throw new Error('GPT API returned invalid or empty content.');
    }

    // Step 6: Split content and verify
    let questionBlocks;
    try {
      questionBlocks = assistantResponse.split('---');
      if (!Array.isArray(questionBlocks) || questionBlocks.length === 0) {
        throw new Error('Failed to split GPT response into question blocks.');
      }
      console.log('Split Question Blocks:', questionBlocks);
    } catch (splitError) {
      console.error('Error splitting GPT response:', splitError.message);
      throw new Error('Failed to split GPT response.');
    }

    // Step 7: Parse the blocks into questions
    const generatedQuestions = questionBlocks
      .map((block, index) => {
        try {
          // Check for basic structure before parsing
          if (!block.includes('Question:') || !block.includes('Options:') || !block.includes('Correct Answer:')) {
            console.warn(`Skipping block ${index + 1}: does not contain required fields.`);
            return null;
          }

          // Match required fields
          const questionMatch = block.match(/Question:\s*(.+)/);
          const optionsMatch = block.match(/Options:\s*(.+)/);
          const correctAnswerMatch = block.match(/Correct Answer:\s*(.+)/);
          const explanationMatch = block.match(/Explanation:\s*(.+)/);

          // Log missing fields for debugging
          if (!questionMatch) console.warn(`Block ${index + 1} is missing 'Question' field.`);
          if (!optionsMatch) console.warn(`Block ${index + 1} is missing 'Options' field.`);
          if (!correctAnswerMatch) console.warn(`Block ${index + 1} is missing 'Correct Answer' field.`);

          // Validate that all required fields exist
          if (questionMatch && optionsMatch && correctAnswerMatch) {
            return {
              question: questionMatch[1].trim(),
              mcq_options: optionsMatch[1].trim(),
              correct_answer: correctAnswerMatch[1].trim(),
              explanation: explanationMatch ? explanationMatch[1].trim() : '', // Optional field
            };
          } else {
            console.warn(`Invalid Block Format ${index + 1}:`, block);
            return null; // Skip invalid blocks
          }
        } catch (error) {
          console.error(`Error parsing block ${index + 1}:`, error.message);
          return null; // Skip blocks that cause errors
        }
      })
      .filter(Boolean); // Remove null values (invalid blocks)

    if (!generatedQuestions || generatedQuestions.length === 0) {
      throw new Error('No valid questions parsed from GPT response.');
    }

    // Step 8: Save questions to database
    const savePromises = generatedQuestions.map(async (q) => {
      let query;
      let values;

      switch (tableName) {
        case 'selectively_mathsquestion':
        case 'selectively_thinkingskillsquestion':
          query = `INSERT INTO ${tableName} 
            (question, mcq_options, correct_answer, explanation, image_data, image_description, type, parent_question_id, subject)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          values = [
            q.question,
            q.mcq_options,
            q.correct_answer,
            q.explanation,
            parentQuestion.image_data,
            parentQuestion.image_description,
            'Generated',
            originalQuestionId,
            subject,
          ];
          break;

        case 'selectively_readingquestion':
          query = `INSERT INTO ${tableName} 
            (question, mcq_options, correct_answer, explanation, type, extract_id, subject)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;
          values = [
            q.question,
            q.mcq_options,
            q.correct_answer,
            q.explanation,
            'Generated',
            originalQuestionId,
            subject,
          ];
          break;

        case 'selectively_writingquestion':
          query = `INSERT INTO ${tableName} 
            (question, type, parent_question_id, subject)
          VALUES (?, ?, ?, ?)`;
          values = [
            q.question,
            'Generated',
            originalQuestionId,
            subject,
          ];
          break;

        default:
          throw new Error('Invalid table name for saving questions.');
      }

      await db.execute(query, values);
    });

    await Promise.all(savePromises);

    console.log('Generated Questions Saved Successfully.');
    return generatedQuestions;

  } catch (error) {
    console.error('Error generating related questions:', error.message);
    throw error;
  }
}

async function extractAndGenerateQuestions(extractId,subject) {
  let tableName;

  console.log('Subject:', subject);
  console.log('Extract ID:', extractId);

  // Determine table name based on the subject
  switch (subject) {
    case 'Reading':
      tableName = 'selectively_readingquestion';
      break;
    default:
      console.log('Invalid subject:', subject);
      return res.status(400).send('Invalid subject for question generation');
  }

  try {
    // Fetch data from both tables
    const [rows] = await db.query(
      `SELECT e.*, r.*
       FROM selectively_extract e
       LEFT JOIN selectively_readingquestion r ON e.id = r.extract_id
       WHERE e.id = ?`,
      [extractId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).send('Extract data not found in the database');
    }

    const extractedData = rows[0];
    console.log('Extracted Data:', extractedData);

    // Create the prompt for GPT
    const prompt = `
      Based on the following data, generate new content:
      
      1. Text: ${extractedData.text}
      2. Question: ${extractedData.question || ''}
      3. Options: ${extractedData.mcq_options || ''}
      4. Correct Answer: ${extractedData.correct_answer || ''}
      5. Explanation: ${extractedData.explanation || ''}

      Requirements:
      - Generate 1 new paragraph of text related to the subject.
      - Generate exactly 5 unique multiple-choice questions (MCQs).
      - Each MCQ must have:
        - Question text
        - Four options (A, B, C, D)
        - Correct Answer
        - Explanation

      Separate questions with '---'.
    `;

    console.log('Prompt Sent to GPT:', prompt);

    // Call GPT API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const assistantResponse = response?.data?.choices?.[0]?.message?.content;
    if (!assistantResponse) {
      throw new Error('GPT API returned invalid content');
    }

    console.log('GPT Response:', assistantResponse);

    // Parse the generated content
    const [newText, ...questionBlocks] = assistantResponse.split('---');

    // Insert the new text into the `selectively_extract` table
    const [insertTextResult] = await db.execute(
      'INSERT INTO selectively_extract (text, subject, type) VALUES (?, ?, ?)',
      [newText.trim(), subject, 'Generated']
    );
    
    const newExtractId = insertTextResult.insertId;

    console.log('New Text Inserted:', newText);

    // Parse and insert generated questions into the `selectively_readingquestion` table
  

    // Parse and insert generated questions into the `selectively_readingquestion` table
    const generatedQuestions = questionBlocks.map((block) => {
      const questionMatch = block.match(/Question [0-9]+:\s*(.+)/); // Adjusted regex for better match
      const optionsMatch = block.match(/Options:\s*([\s\S]+?)Correct Answer:/); // Capture multiline options
      const correctAnswerMatch = block.match(/Correct Answer:\s*(.+)/);
      const explanationMatch = block.match(/Explanation:\s*(.+)/);
      if (questionMatch && optionsMatch && correctAnswerMatch) {
        return {
          question: questionMatch[1].trim(),
          mcq_options: optionsMatch[1].trim(),
          correct_answer: correctAnswerMatch[1].trim(),
          explanation: explanationMatch ? explanationMatch[1].trim() : '',
        };
      }
      return null;
    }).filter(Boolean);

    

    // Save questions in the database
    const savePromises = generatedQuestions.map((q) => {
      return db.execute(
        `INSERT INTO ${tableName} 
         (question, mcq_options, correct_answer, explanation, type, extract_id, subject)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          q.question,
          q.mcq_options,
          q.correct_answer,
          q.explanation,
          'Generated',
          newExtractId,
          subject,
        ]
      );
    });

    await Promise.all(savePromises);

    console.log('Generated Questions Inserted:', generatedQuestions);

    return res.status(201).json({
      message: 'New text and questions generated successfully',
      newText,
      questions: generatedQuestions,
    });
  } catch (error) {
    console.error('Error generating text and questions:', error.message);
    return res.status(500).send('An error occurred while generating content');
  }
}




module.exports = {
  generateRelatedQuestions,extractAndGenerateQuestions
};
