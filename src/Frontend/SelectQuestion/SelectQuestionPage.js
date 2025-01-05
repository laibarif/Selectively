import React, { useEffect, useState } from 'react';
import { useParams,  useNavigate} from 'react-router-dom';
import axios from 'axios';
import './SelectQuestionPage.css'; // Add custom styles

const SelectQuestionPage = () => {
  const { subject } = useParams();
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);      
  const navigate = useNavigate();

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

  // const handleGenerateClick = (questionId) => {
  //   navigate(`/questions/${subject}/${questionId}`);
  // };
  const handleGenerateClick = async (questionId) => {
    alert("Please wait for few seconds while the questions are being generated...");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/generate-questions`,
        { originalQuestionId: questionId, subject: subject } // Add subject here
      );
    
      if (response.data) {
        navigate(`/questions/${subject}/${questionId}`, { state: { generatedQuestions: response.data.generatedQuestions } });
      } else {
        console.error('No data returned from generate questions API');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError("Failed to generate questions. Please try again.");
    }
  };
  
  const handleGenerateExtractClick = async (questionId) => {
    alert("Please wait for few seconds while the extract questions are being generated...");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/extract-generate-questions`,
        { extractId: questionId, subject: subject } // Add subject here
      );
      console.log("bhia ho jaa", response.data)
      // if (response.data) {
      //   navigate(`/readingQuestion/${subject}/${questionId}`, { state: { extractGeneratedQuestions: response.data.extractGeneratedQuestions } });
      // } else {
      //   console.error('No data returned from generate extract questions API');
      // }
    } catch (error) {
      console.error('Error generating extract questions:', error);
      setError("Failed to generate extract questions. Please try again.");
    }
  };



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
              <table className="table table-bordered table-hover shadow-sm ">
                <thead className="thead-dark bg-black w-full">
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
                      <td className="flex gap-x-5 text-center ">
                        <button className="btn btn-success btn-sm" onClick={() => handleGenerateClick(question.id)}>
                          Generate
                        </button>
                        { subject==='Reading'&&
                         
                         <button className="btn btn-success btn-sm" onClick={() => handleGenerateExtractClick(question.id)}>
                           Generate Extact + Questions
                         </button>
                      
                      }
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
