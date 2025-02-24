import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './GenerateQuestionPage.css'; // Ensure this CSS is correctly linked

const GenerateQuestionPage = () => {
  const { id, subject } = useParams();
  const [questionDetails, setQuestionDetails] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // For generated questions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  



  useEffect(() => {
    if (!id || !subject) {
      console.error("Invalid id or subject parameters");
      setError("Invalid parameters provided.");
      setLoading(false);
      return;
    }

    const fetchQuestionDetails = async () => {
      try {
        const originalQuestionUrl = `${process.env.REACT_APP_BACKEND_URL}/api/questions/question/${id}?subject=${subject}`;
        const generatedQuestionsUrl = `${process.env.REACT_APP_BACKEND_URL}/api/questions/generated/${id}?subject=${subject}`;
 
        // Fetch original question and generated questions concurrently
        const [originalResponse, generatedResponse] = await Promise.all([
          axios.get(originalQuestionUrl),
          axios.get(generatedQuestionsUrl),
        ]);

        setQuestionDetails(originalResponse.data);
        setGeneratedQuestions(generatedResponse.data || []);
      } catch (error) {
        setError("Failed to fetch question details. Please try again.");
        console.error("Error fetching question details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionDetails();
  }, [id, subject]);

  if (loading)
    return (
      <div className="text-center loader">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger text-center" role="alert">
        {error}
      </div>
    );
  

  return (
    <div className="generate-container">
      <h1 className="mb-4 text-center">Question Details for {subject}</h1>

      {/* Original Question Section */}
      {!questionDetails ? (
        <p className="text-center">No details available for this question.</p>
      ) : (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h3>Original Question</h3>
          </div>
          <div className="card-body">
            <h4>{questionDetails.question}</h4>
            <p>
              <strong>Type:</strong> {questionDetails.type}
            </p>
           {
            questionDetails.mcq_options && questionDetails.mcq_options.trim() && (
           
            <p>
              <strong>Options:</strong>
              <ul>
                {questionDetails.mcq_options
                  ? questionDetails.mcq_options.split(',').map((option, idx) => (
                    <li key={idx}>{option.trim()}</li>
                  ))
                  : 'N/A'}
              </ul>
            </p>
            )
            }
            {
              questionDetails.correct_answer && questionDetails.correct_answer.trim() && (
            <p className="correct-answer">
              <strong>Correct Answer:</strong> {questionDetails.correct_answer}
            </p>
             )
            }
             {
              questionDetails.explanation && questionDetails.explanation.trim() && (
            <p>
              <strong>Explanation:</strong> {questionDetails.explanation}
            </p>
              )
              }
           

            {questionDetails.image_data && (
              <div className="text-center">
                <h5>Image:</h5>
                <img
                  src={`data:image/jpeg;base64,${questionDetails.image_data}`}
                  alt={questionDetails.image_description || 'Question image'}
                  className="img-fluid rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Questions Section */}
      <div className="generated-questions-section">
        <h2 className="mb-4 text-center">Generated Questions</h2>
        {generatedQuestions.length > 0 ? (
          <div className="generated-questions-container" style={{ paddingTop: 10 }}>
            {generatedQuestions.map((question, index) => (
              <div key={index} className="card mb-3 shadow-sm" style={{ marginTop: 30 }}>
                <div className="card-header bg-secondary text-white">
                  <h4>Generated Question</h4>
                </div>
                <div className="card-body">
                  <h5>{question.question}</h5>
                  {
                    question.mcq_options &&
                    <p>
                  <strong>Options:</strong>
                    <ul>
                      {question.mcq_options
                        ? question.mcq_options.split(',').map((option, idx) => (
                          <li key={idx}>{option.trim()}</li>
                        ))
                        : 'N/A'}
                    </ul>
                  </p>
                  }
                  {
                    question.correct_answer && 
                    <p className="correct-answer">
                    <strong>Correct Answer:</strong> {question.correct_answer || 'N/A'}
                  </p>
                  }
                  {
                    question.explanation &&
                    <p>
                    <strong>Explanation:</strong> {question.explanation || 'N/A'}
                  </p>
                  }
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info text-center" role="alert">
            No generated questions available for this original question.
          </div>
        )}
      </div>
    </div>

  );
};

export default GenerateQuestionPage;
