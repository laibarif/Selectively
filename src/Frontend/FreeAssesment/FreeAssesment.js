import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Loader2.css'
import fressassesment from '../../assets/asessmentbg.jpg'
const FreeAssesment = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setIsError(false);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/userdetailforassesment`,
        {  email }
      );

      setMessage(response.data.message || "Submission successful!");
      localStorage.setItem("userEmail", email);
      navigate("/test-assesment-books");
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center  bg-gray-200"
      
      style={{
        overflow: 'hidden',
        height: '86vh',
        margin: 0,
        padding: 0,
        backgroundImage: `url(${fressassesment})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white py-10 px-8 rounded-lg w-72  md:w-full sm:max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 ">
          Student Information
        </h2>

        {message && (
          <div
            className={`p-3 mb-4 text-sm rounded-lg ${
              isError
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
        

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="w-full flex  ">
          <button
            type="submit"
            className="w-1/2 mx-auto py-3 mt-4 text-black bg-yellow-400  font-semibold rounded-lg hover:bg-yellow-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Submit
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreeAssesment;
