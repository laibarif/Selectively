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
  const [filter, setFilter] = useState("All"); // Single filter state for dropdown

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
    if (questionText.image_description)
      formData.append("image_description", questionText.image_description);
    if (questionText.image_data)
      formData.append("image_data", questionText.image_data);

    setLoading(true);
    try {
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`); // Debug: Log fields being sent
      }
      await axios.put(
        `http://localhost:5000/api/questions/update-questions/${selectedQuestion}?subject=${subject}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
      const response = await axios.get(
        `http://localhost:5000/api/questions/get-question/${id}`,
        { params: { subject } }
      );
      setViewQuestion(response.data); // Set the question details for viewing
    } catch (error) {
      setError("Error fetching question details");
    }
  };
  {
    /* <div class="w-3/12  pt-6 block  ">
    <label class="flex text-center pl-14 pb-1 font-bold">Search Questions Types</label>
  <select 
    onChange="handleFilterChange(event)" 
    value="filter" 
    class="block mx-auto w-72 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="All">All</option>
    <option value="Generated">Generated</option>
    <option value="Original">Original</option>
  </select>
</div> */
  }
  return (
    <>
      <div className="w-4/12 ">
        <label className="block mx-auto w-72 px-1 font-semibold py-1 mt-8 text-gray-700 bg-white ">
          Search Questions type
        </label>
        <select
          onChange={handleFilterChange}
          value={filter}
          className="block mx-auto w-72 px-4 py-2  text-gray-700 bg-white "
        >
          <option value="All">All</option>
          <option value="Generated">Generated</option>
          <option value="Original">Original</option>
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
                  {filteredQuestions.map((question, index) => (
                    <tr key={question.id}>
                      <td>{index + 1}</td>
                      <td>{question.question.slice(0, 80)}...</td>
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
                    Question:
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
                    Image Description:
                  </label>
                  <input
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
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewQuestion && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-10/12 max-w-4xl">
              {/* Conditionally render the Image Description */}
              {viewQuestion.image_description && (
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-700">
                    <strong className="mr-2">Image Description:</strong>
                    <span className=""> {viewQuestion.image_description}</span>
                  </p>
                </div>
              )}

              {/* Conditionally render the Image */}
              {viewQuestion.image_data && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={viewQuestion.image_data}
                    alt="image-desc"
                    className="h-40 w-40 object-cover border border-gray-300 rounded-md"
                  />
                </div>
              )}

              <div className="mb-4">
                <p className="text-lg font-semibold text-black">
                  Question:
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
                <ul className="space-y-2 mb-4">
                  {viewQuestion.mcq_options &&
                    viewQuestion.mcq_options.split(",").map((option, index) => (
                      <li key={index} className="text-gray-700">
                        <span>{option}</span>
                      </li>
                    ))}
                </ul>
              )}
              {viewQuestion.correct_answer && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    <strong>Correct Answer:</strong>{" "}
                    <span className="text-blue-500 font-semibold">
                      {viewQuestion.correct_answer}
                    </span>
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setViewQuestion(null)}
                >
                  Back to Questions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewQuestionsPage;
