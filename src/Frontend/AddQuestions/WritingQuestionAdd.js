import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WritingQuestionAdd() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: 'Writing',
    question: '',
    type: '',
   
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
       
      
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/addQuestions/addWritingQuestions`, formData);
      console.log('Response:', response.data);
      setFormData({
        question: '',
        type: '',
      });
      navigate('/add-questionsBooks')
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-6 shadow-slate-400">
      <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">Writing Question Add</h2>
      <form onSubmit={handleSubmit}>
        

        {/* Question */}
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="question">
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

        {/* Type Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2" htmlFor="type">
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
            <option value="Generated">Generated</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 transition duration-200"
          >
            Add Question
          </button>
        </div>
      </form>
    </div>
  );
}


export default WritingQuestionAdd