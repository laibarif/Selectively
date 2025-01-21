import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Loader2.css";
import fressassesment from "../../assets/asessmentbg.jpg";
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
      console.log("URL", process.env.REACT_APP_BACKEND_URL);
      const response = await axios.post(
        `https://api.selectiveexam.com.au/api/freeassesment/userdetailforassesment`,
        { email }
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
      className="w-full flex flex-col items-center justify-center  bg-gray-200"
      style={{
        overflow: "hidden",
        height: "86vh",
        margin: 0,
        padding: 0,
        backgroundImage: `url(${fressassesment})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="py-10 px-8 rounded-lg w-1/2">
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
            <p className="mt-2 text-sm text-gray-500">
              <strong>Email Address:</strong> This email will be used to send
              the report once the student has finished the free assessment.
            </p>
          </div>

          <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Instructions for the Free Assessment
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Please read the instructions carefully before commencing the test.
            </p>
            <ul className="list-decimal list-inside text-sm text-gray-600 space-y-2">
              <li>
                There are 3 assessments of Reading, Mathematical Reasoning, and
                Thinking Skills in this session.
              </li>
              <li>
                After you have selected an answer, click the{" "}
                <strong>NEXT</strong> button (bottom right-hand) to proceed to
                the following question.
              </li>
              <li>
                If you want to revisit any of your previously selected answers,
                click the <strong>Previous</strong> button (bottom right-hand).
              </li>
              <li>
                You can change your answer anytime within the allocated test
                time.
              </li>
              <li>
                Click <strong>Submit</strong> once you finish the test.
              </li>
            </ul>
            <p className="mt-4 font-semibold text-gray-700">All the best!</p>
          </div>

          <div className="w-full flex">
            <button
              type="submit"
              className="w-1/2 mx-auto py-3 mt-4 text-black bg-yellow-400 font-semibold rounded-lg hover:bg-yellow-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FreeAssesment;




{/* <form onSubmit={handleSubmit}>
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
    <p className="mt-2 text-sm text-gray-500">
      This email will be used to send the report once the student has finished the free assessment.
    </p>
  </div>

  <div className="mb-4">
    <h2 className="text-lg font-medium text-gray-700">
      Instructions for the Free Assessment
    </h2>
    <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
      <li>
        There are 3 assessments of <strong>Reading</strong>, <strong>Mathematical Reasoning</strong>, and <strong>Thinking Skills</strong> in this session.
      </li>
      <li>
        After you have selected an answer, click the <strong>NEXT</strong> button (bottom right) to proceed to the following question.
      </li>
      <li>
        If you want to revisit any of your previously selected answers, click the <strong>Previous</strong> button (bottom right).
      </li>
      <li>
        You can change your answer anytime within the allocated test time.
      </li>
      <li>
        Click <strong>Submit</strong> once you finish the test.
      </li>
    </ul>
    <p className="mt-4 text-sm font-medium text-gray-700">All the best!</p>
  </div>

  <div className="w-full flex">
    <button
      type="submit"
      className="w-1/2 mx-auto py-3 mt-4 text-black bg-yellow-400 font-semibold rounded-lg hover:bg-yellow-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Submit
    </button>
  </div>
</form> */}
