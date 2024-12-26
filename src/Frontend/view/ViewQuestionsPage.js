import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ViewQuestionPage.css'; // Add custom styles

const ViewQuestionsPage = () => {
  const { subject } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/questions/views-questions/${subject}`);
        console.log(response)
        setQuestions(response.data.questions);
      } catch (error) {
        setError('Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject]);

  return (
    <div className="select-question-container">
      <h1 className="select-question-heading text-center mb-4 text-primary">
        View questions of {subject}
      </h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      ) : (
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
              <tr key={question.id}>
                <td>{index + 1}</td>
                <td>{question.question ? question.question.slice(0, 80) : 'No question text available'}...</td>
                <td>{question.type || 'N/A'}</td>
                <td className="text-center flex justify-between gap-2">
                  
                    <button className="btn btn-sm btn-view">View</button>
                    <button className="btn btn-sm btn-edit">Edit</button>
                    <button className="btn btn-sm btn-finalize">finalize</button>
                    <button className="btn btn-sm btn-delete">Delete</button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      )}
    </div>
  );
};

export default ViewQuestionsPage;
