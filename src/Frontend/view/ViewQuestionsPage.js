import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ViewQuestionPage.css"; // Add custom styles

const ViewQuestionsPage = () => {
  const { subject } = useParams(); // Get subject from URL params
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeading, setShowHeading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionText, setQuestionText] = useState({});
  const [type, setType] = useState("");
  const [viewQuestion, setViewQuestion] = useState(null);
  // Fetch questions from the API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/questions/views-questions/${subject}`
      );
     
      setQuestions(response.data.questions);
    } catch (error) {
      setError("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  // Function to handle finalizing the question
  const handleQuestionStatus = async (id) => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/questions/update-question/${id}`,
        null,
        { params: { subject } }
      );
      setShowHeading(false);
      await fetchQuestions();
      setMessage("Question finalized successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage("Failed to finalize the question");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting the question
  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/questions/delete-question/${id}`,
        { params: { subject } }
      );
      setDeleteConfirm(null);
      await fetchQuestions();
      setMessage("Question deleted successfully");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage(error.response.data.message);
      setDeleteConfirm(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Function to handle editing the question
  const handleEdit = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/questions/get-question/${id}`,
        { params: { subject } }
      );
     
      setQuestionText(response.data);
      setType(response.data.type);
      setSelectedQuestion(id);
    } catch (error) {
      setError("Error fetching question details");
    }
  };

  // Handle the form submission for updating the question
  const handleUpdate = async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    const formData = new FormData();
    formData.append("question", questionText.question);
    formData.append("mcq_options", questionText.mcq_options);
    formData.append("correct_answer", questionText.correct_answer);
    formData.append("explanation", questionText.explanation || "");
    formData.append("image_description", questionText.image_description || "");
  
    if (questionText.image_data) {
      formData.append("image_data", questionText.image_data); // Changed to match backend
    }
  
    setLoading(true);
    try {
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      await axios.put(
        `http://localhost:5000/api/questions/update-questions/${selectedQuestion}?subject=${subject}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("Question updated successfully");
      setTimeout(() => setMessage(null), 3000);
      fetchQuestions();
    } catch (error) {
      setError("Error updating question");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/questions/get-question/${id}`,
        { params: { subject } }
      );
      setViewQuestion(response.data); // Set the question details for viewing
    } catch (error) {
      setError("Error fetching question details");
    }
  };
  console.log(viewQuestion)
  return (
    <div className="select-question-container">
      {showHeading && (
        <h1 className="select-question-heading text-center mb-4 text-primary">
          View questions of {subject}
        </h1>
      )}

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
        <>
          {message && <div className="text-2xl text-red-600 font-semibold">{message}</div>}
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
                    <td>{question.question.slice(0, 80)}...</td>
                    <td>{question.type || "N/A"}</td>
                    <td className="text-center flex justify-between gap-2">
                      <button className="btn btn-sm btn-view"
                      onClick={() => handleView(question.id)}
                      >View</button>
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(question.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-finalize"
                        onClick={() => handleQuestionStatus(question.id)}
                      >
                        Finalize
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => setDeleteConfirm(question.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {deleteConfirm && (
        <div className="popup">
          <div className="popup-content">
            <p>Are you sure you want to delete this question?</p>
            <button
              className="btn btn-danger"
              onClick={() => handleDeleteQuestion(deleteConfirm)}
            >
              Yes
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedQuestion && questionText && type && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit Question</h2>
            <form onSubmit={handleUpdate}>
              <div>
                <label className="text-3xl font-bold">Question:</label>
                <textarea
                  rows="3"
                  placeholder="Enter question text"
                  value={questionText.question || ""}
                  onChange={(e) =>
                    setQuestionText((prev) => ({ ...prev, question: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-3xl font-bold">Options:</label>
                <input
                  value={questionText.mcq_options || ""}
                  onChange={(e) =>
                    setQuestionText((prev) => ({ ...prev, mcq_options: e.target.value }))
                  }
                  placeholder="Enter options separated by commas"
                  required
                />
              </div>
              <div>
                <label className="text-3xl font-bold">Correct Answer:</label>
                <input
                  value={questionText.correct_answer || ""}
                  onChange={(e) =>
                    setQuestionText((prev) => ({ ...prev, correct_answer: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="text-3xl font-bold">Explanation:</label>
                <textarea
                  value={questionText.explanation || ""}
                  onChange={(e) =>
                    setQuestionText((prev) => ({ ...prev, explanation: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-3xl font-bold">Image Description:</label>
                <input
                  value={questionText.image_description || ""}
                  onChange={(e) =>
                    setQuestionText((prev) => ({
                      ...prev,
                      image_description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-3xl font-bold">Image:</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setQuestionText((prev) => ({ ...prev, image_data: e.target.files[0] }))
                  }
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2">
                Save
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuestion(null)}
                className="btn btn-secondary mt-2"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
       {viewQuestion && (
        <div className="popup">
          <div className="popup-content max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
           
           {/* Conditionally render the Image Description */}
{viewQuestion.image_description && (
  <p className="text-sm text-gray-600 mb-4">
    <strong>Image Description:</strong> {viewQuestion.image_description}
  </p>
)}

{/* Conditionally render the Image */}
{viewQuestion.image_data && (
  <div>
    <img 
      src={viewQuestion.image_data} 
      alt="image-desc" 
      className="h-32 w-32" 
    />
  </div>
)}


            <div className="mb-4">
              <p className="text-lg font-semibold">Question: {viewQuestion.question}</p>
            </div>

            <ul className="space-y-2">
              {viewQuestion.mcq_options && viewQuestion.mcq_options.split(',').map((option, index) => (
                <li key={index}>
                  <span>{option}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                <strong>Correct Answer:</strong> <span className="text-blue-500 font-semibold">{viewQuestion.correct_answer}</span>
              </p>
            </div>

            <div className="mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setViewQuestion(null)}
              >
                Back to Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewQuestionsPage;
