import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './SelectQuestionPage.css'; // Add custom styles

const SelectQuestionPage = () => {
  const { subject } = useParams();
  const [questions, setQuestions] = useState([]); // Holds questions fetched from the backend
  const [loading, setLoading] = useState(true);   // Loading state
  const [error, setError] = useState(null);       // Error state for handling errors

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch questions for the selected subject
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/questions/${subject}`);
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.questions)) {
          setQuestions(response.data.questions);
        } else {
          console.warn("Unexpected API response structure:", response.data);
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError("Failed to fetch questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject]);

  return (
    <div className="select-question-container mt-5">
      <h1 className="select-question-heading text-center mb-4 text-primary">Questions for {subject}</h1>

      {/* Loading State */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        // Error State
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : (
        // Questions Table
        <>
          {questions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover shadow-sm">
                <thead className="thead-dark">
                  <tr>
                    <th>#</th>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{question.question ? question.question.slice(0, 80) : "No question text available"}...</td>
                      <td>{question.type || "N/A"}</td>
                      <td className="text-center">
                        <button className="btn btn-success btn-sm">
                          Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // No Questions Available
            <div className="alert alert-warning text-center" role="alert">
              No questions available for this subject.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SelectQuestionPage;
