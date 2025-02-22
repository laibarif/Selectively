import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./ViewQuestionPage.css"; // Add custom styles

const PAGE_SIZE = 50

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
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const handleFilterChange = (e) => {
    setFilter(e.target.value); // Update filter with selected value
  };

  const filteredQuestions = questions.filter((question) => {
    if (filter === "All") return true; // Show all if "All" is selected
    return question.type === filter; // Show only the selected type
  });

  // Fetch questions from the API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/views-questions/${subject}`
      );
      console.log("view", response.data.questions)
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
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/update-question/${id}`,
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
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/delete-question/${id}`,
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
    const index = filteredQuestions.findIndex((q) => q.id === id)
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/get-question/${id}`,
        { params: { subject } }

      );
      setSelectedQuestionIndex(index);
      setQuestionText(response.data);
      setType(response.data.type);
      setSelectedQuestion(id);
    } catch (error) {
      setError("Error fetching question details");
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData();

    // Dynamically append fields only if they have a value
    if (questionText.question)
      formData.append("question", questionText.question);
    if (questionText.mcq_options)
      formData.append("mcq_options", questionText.mcq_options);
    if (questionText.correct_answer)
      formData.append("correct_answer", questionText.correct_answer);
    if (questionText.explanation)
      formData.append("explanation", questionText.explanation);
    if (questionText.category)
      formData.append("category", questionText.category);
    if (questionText.level)
      formData.append("level", questionText.level);
    if (questionText.exam_type)
      formData.append("exam_type", questionText.exam_type);
    if (questionText.image_description)
      formData.append("image_description", questionText.image_description);
    // if (questionText.image_data)
    //   formData.append("image_data", questionText.image_data);
    if (questionText.image_data instanceof File) {
      formData.append("image_data", questionText.image_data);
    }

    setLoading(true);
    try {
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`); // Debug: Log fields being sent
      }
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/update-questions/${selectedQuestion}?subject=${subject}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      setMessage("Question updated successfully");
      setTimeout(() => setMessage(null), 3000);
      setSelectedQuestion(null); // Clear the selected question
      fetchQuestions(); // Refresh the question list
    } catch (error) {
      setError("Error updating question");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      console.log('url', process.env.REACT_APP_BACKEND_URL)
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/get-question/${id}`,
        { params: { subject } }
      );
      console.log('image', response.image_data);
      const index = filteredQuestions.findIndex((q) => q.id === id);
      if (index !== -1) {
        setCurrentQuestionIndex(index);
        setViewQuestion(response.data);
      } else {
        setError("Question not found in the filtered list.");
      }
    } catch (error) {
      setError("Error fetching question details");
    }
  };

  console.log(viewQuestion)
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);

  const currentQuestions = filteredQuestions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div>

      <div className="w-4/12 shadow-none">
        <label className="block mx-auto w-72 px-1 font-semibold py-1 mt-8 text-gray-700 ">
          Search Questions type
        </label>
        <select
          onChange={handleFilterChange}
          value={filter}
          className="block mx-auto w-72 px-4 py-2  text-gray-700 "
        >
          <option value="All">All</option>
          <option value="Original">Original</option>
          <option value="Generated">Generated</option>
          <option value="Finalized">Finalized</option>
        </select>
      </div>
      <div className="select-question-container">

        {showHeading && (
          <h1 className="select-question-heading text-center mb-4 text-primary">
            View questions of {subject}
          </h1>
        )}

        {loading ? (
          <div className="text-center">
            <div class="loader"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        ) : (
          <>
            {message && (
              <div className="text-2xl text-red-600 font-semibold">
                {message}
              </div>
            )}
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
                  {currentQuestions.map((question, index) => (
                    <tr key={question.id}>
                      <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      {/* <td>{index + 1}</td> */}
                      <td>{question.question?.slice(0, 80)}...</td>
                      <td>{question.type || "N/A"}</td>
                      <td className="text-center flex justify-between gap-2">
                        <button
                          className="btn btn-sm btn-view"
                          onClick={() => handleView(question.id)}
                        >
                          View
                        </button>
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
            <div className="pagination-container text-center mt-6">
              <button
                className="btn-prev text-white bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="mx-2 text-lg text-gray-800">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-next text-white bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:from-yellow-500 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>


          </>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Are you sure you want to delete this question?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteQuestion(deleteConfirm)}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedQuestion && questionText && type && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-10/12 max-w-4xl mx-auto overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Edit Question
              </h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Question: {questionText.id || ""}
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter question text"
                    value={questionText.question || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        question: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Options:
                  </label>
                  <input
                    value={questionText.mcq_options || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        mcq_options: e.target.value
                      }))
                    }
                    placeholder="Enter options separated by commas"
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Correct Answer:
                  </label>
                  <input
                    value={questionText.correct_answer || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        correct_answer: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Explanation:
                  </label>
                  <textarea
                    value={questionText.explanation || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        explanation: e.target.value
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Type:
                  </label>
                  <input
                    value={questionText.type || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        type: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  {(subject === "Maths" || subject === "Reading") && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-1">
                        Topic (Category):
                      </label>
                      <input
                        value={questionText.category || ""}
                        onChange={(e) =>
                          setQuestionText((prev) => ({
                            ...prev,
                            category: e.target.value
                          }))
                        }
                        required
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Exam Type:
                  </label>
                  <input
                    value={questionText.exam_type || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        exam_type: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Level:
                  </label>
                  <input
                    value={questionText.level || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        level: e.target.value
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Image Description:
                  </label>
                  <textarea
                    value={questionText.image_description || ""}
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        image_description: e.target.value
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-1">
                    Image:
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setQuestionText((prev) => ({
                        ...prev,
                        image_data: e.target.files[0]
                      }))
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  />
                </div>
                <div className="flex justify-between items-center space-x-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md shadow ${selectedQuestionIndex > 0
                      ? "bg-gray-500 hover:bg-gray-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={selectedQuestionIndex === 0}
                    onClick={() => {
                      const prevIndex = selectedQuestionIndex - 1;
                      setSelectedQuestion(filteredQuestions[prevIndex].id);
                      setQuestionText(filteredQuestions[prevIndex]);
                      setType(filteredQuestions[prevIndex].type);
                      setSelectedQuestionIndex(prevIndex);
                    }}
                  >
                    Previous
                  </button>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded-md shadow hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQuestion(null)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-400 focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md shadow ${selectedQuestionIndex < filteredQuestions.length - 1
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    disabled={selectedQuestionIndex === filteredQuestions.length - 1}
                    onClick={() => {
                      const nextIndex = selectedQuestionIndex + 1;
                      setSelectedQuestion(filteredQuestions[nextIndex].id);
                      setQuestionText(filteredQuestions[nextIndex]);
                      setType(filteredQuestions[nextIndex].type);
                      setSelectedQuestionIndex(nextIndex);
                    }}
                  >
                    Next
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {viewQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
            <div className="bg-white rounded-lg shadow-lg p-6 w-10/12 max-w-5xl max-h-[90vh] overflow-y-auto">

              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  ID:
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.id}
                  </span>
                </p>
              </div>

              {viewQuestion.text && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-black">
                    Passage Text:
                    <span className="text-gray-500 ml-2">
                      {viewQuestion.text}
                    </span></p>
                </div>
              )}

              {/* Conditionally render the Image Description */}
              {viewQuestion.image_description && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-black">
                    Image Description:
                    <span className="text-gray-500 ml-2"> {viewQuestion.image_description}</span>
                  </p>
                </div>
              )}

              {/* Conditionally render the Image */}
              {viewQuestion.image_data && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-black">Image: </p>
                  <div className="flex justify-center">
                    <img
                      src={
                        viewQuestion.image_data?.startsWith("http")
                          ? viewQuestion.image_data
                          : `http://${viewQuestion.image_data}` // Adjust this as needed
                      }
                      alt={viewQuestion.image_description || 'Question image'}
                      className="h-60 w-100 object-cover border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Question {viewQuestion.id}:
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.question}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Status:
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.type}
                  </span>
                </p>
              </div>

              {viewQuestion.mcq_options && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-black">MCQs Options</p>
                  <ul className="space-y-2">
                    {viewQuestion.mcq_options.split(",").map((option, index) => (
                      <li key={index} className="text-gray-500 font-semibold">
                        <span>{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewQuestion.correct_answer && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-black">
                    Correct Answer:{" "}
                    <span className="text-green-700 font-bold">
                      {viewQuestion.correct_answer}
                    </span>
                  </p>
                </div>
              )}
              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Level:
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.level}
                  </span>
                </p>
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Topic(Category):
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.category ? viewQuestion.category : "Not added yet"}
                  </span>
                </p>
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Exam Type:
                  <span className="text-gray-500 ml-2">
                    {viewQuestion.exam_type ? viewQuestion.exam_type : "Not added yet"}
                  </span>
                </p>
              </div>
              {viewQuestion.explanation && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-black">
                    Explanation:{" "}
                    <span className="text-gray-500 ml-2">
                      {viewQuestion.explanation.split(/\r\n|\n/).map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </span>
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center mt-6">
                <button
                  className={`px-4 py-2 rounded-md shadow ${currentQuestionIndex > 0
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    const prevIndex = currentQuestionIndex - 1;
                    setViewQuestion(filteredQuestions[prevIndex]);
                    setCurrentQuestionIndex(prevIndex);
                  }}
                >
                  Previous
                </button>

                <button
                  className={`px-4 py-2 rounded-md shadow ${currentQuestionIndex < filteredQuestions.length - 1
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  disabled={currentQuestionIndex === filteredQuestions.length - 1}
                  onClick={() => {
                    const nextIndex = currentQuestionIndex + 1;
                    setViewQuestion(filteredQuestions[nextIndex]);
                    setCurrentQuestionIndex(nextIndex);
                  }}
                >
                  Next
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-orange-400"
                  onClick={() => setViewQuestion(null)}
                >
                  Back to Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewQuestionsPage;
