import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ThinkingSkillQuestionAdd() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "Thinking Skills",
    question: "",
    mcq_options: "",
    correct_answer: "",
    explanation: "",
    image_data: "",
    image_description: "",
    type: "",
    level: "",
    exam_type: "",
    parent_question_id: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setFormData({
      ...formData,
      [name]: file,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (key === "image_data" && formData[key]) {
        data.append(key, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    }
        //space allow regix
    // const mcqOptionsRegex = /^(A\s+[A-Z\s]+),\s*B\s+[A-Z\s]+,\s*C\s+[A-Z\s]+,\s*D\s+[A-Z\s]+$/i;
    // const mcqOptionsRegex = /^(A\s[^,]+,\sB\s[^,]+,\sC\s[^,]+,\sD\s[^,]+)$/;
    const mcqOptionsRegex = /^((?:[A-Z]\s[^,]+,?\s*)+)$/;
    const correctAnswerRegex = /^[A-Z]$/;

    if (!mcqOptionsRegex.test(formData.mcq_options.trim())) {
      alert(
        "MCQ Options must be in the correct format: A option, B option, C option, D option"
      );
      return;
    }

    if (!correctAnswerRegex.test(formData.correct_answer.trim())) {
      alert("Correct Answer must be in the format: A or B or C or D");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/addQuestions/addThinkingSkillQuestions`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Response:", response.data);
      setFormData({
        question: "",
        mcq_options: "",
        correct_answer: "",
        explanation: "",
        image_data: "",
        image_description: "",
        type: "",
        level: "",
        exam_type: ""
      });
      navigate("/add-questionsBooks");
      // Handle the API response (e.g., display a success message)
    } catch (error) {
      console.error("Error submitting the form:", error);
      // Handle error (e.g., display an error message)
    } finally {
      setLoading(false); // Set loading state to false after API call completes
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg my-6 shadow-slate-400">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
       Add Thinking Skill Question
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Question */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="question"
          >
            Question
          </label>
          <textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter question"
            required
          />
        </div>

        {/* MCQ Options */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="mcqOptions"
          >
            MCQ Options
          </label>
          <textarea
            id="mcq_options"
            name="mcq_options"
            value={formData.mcq_options}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter MCQ options (e.g., A statement 1 only, B statement 2 only, ...)"
            required
          />
        </div>

        {/* Correct Answer */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="correctAnswer"
          >
            Correct Answer
          </label>
          <input
            type="text"
            id="correct_answer"
            name="correct_answer"
            value={formData.correct_answer}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter correct answer"
            required
          />
        </div>

        {/* Explanation */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="explanation"
          >
            Explanation
          </label>
          <textarea
            id="explanation"
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter explanation"
            required
          />
        </div>

        {/* Image Data */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="imageData"
          >
            Image Data (File)
          </label>
          <input
            type="file"
            id="image_data"
            name="image_data"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
        </div>

        {/* Image Description */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="imageDescription"
          >
            Image Description
          </label>
          <textarea
            id="image_description"
            name="image_description"
            value={formData.image_description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Enter image description"
          />
        </div>

        {/* Level Dropdown */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="level"
          >
            Level
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Level</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Difficult">Difficult</option>
          </select>
        </div>

        {/* Type Dropdown */}
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="type"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Type</option>
            <option value="Original">Original</option>
            <option value="Finalized">Finalized</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-lg font-medium mb-2"
            htmlFor="correctAnswer"
          >
            Exam Type
          </label>
          <input
            type="text"
            id="exam_type"
            name="exam_type"
            value={formData.exam_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Exam Type (Practice, Weekly, Monthly)"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-500 transition duration-200"
          >
            {loading ? "Question Adding..." : "Add Question"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ThinkingSkillQuestionAdd;
