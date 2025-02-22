import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../FreeAssesment/loader.css";
import logo from "../../assets/Logo_White - Complete.svg";

function TestPage() {
  const { testType, category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timerEnded, setTimerEnded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  const testTimers = {
    "practice-test": 10 * 60,
    "weekly-test": 20 * 60,
    "mega-test": 30 * 60,
    "subject-test": 15 * 60,
  };

  const initialTime = testTimers[testType] || 12 * 60;
  const timerRef = useRef(initialTime);
  const [timer, setTimer] = useState(timerRef.current);

  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, null, window.location.pathname);
      alert("Back navigation is disabled during the test.");
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/tests/${testType}/${category}`
        );

        setQuestions(response.data.questions);
        setAnswers(new Array(response.data.questions.length).fill(null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testType, category]);

  useEffect(() => {
    if (timer <= 0) {
      setTimerEnded(true);
      handleSubmit();
      return;
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(countdown);
          setTimerEnded(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleSubmit = async () => {
    const questionStatus = questions.map((question, index) => ({
      questionNumber: index + 1,
      status: answers[index] ? "attempted" : "unattempted",
    }));

    const score = questionStatus.reduce((acc, item, index) => {
      return answers[index]?.charAt(0) === questions[index].correct_answer.charAt(0) ? acc + 1 : acc;
    }, 0);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tests/submit`, {
        testType,
        category,
        score,
        questionStatus,
      });

      navigate("/student-dashboard");
    } catch (error) {
      toast.error("Error submitting test.");
    }
  };

  const handleSelectAnswer = (value, label) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = `${label}: ${value}`;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="loadingspinner"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        No questions found.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="absolute w-full h-24 flex justify-between items-center py-1 px-3 rounded-md bg-white shadow-md z-10">
        <img src={logo} alt="logo" className="h-24 w-32" />
        <div className="flex justify-center items-center bg-black text-white text-xl font-bold p-1 shadow-lg">
          <span>{Math.floor(timer / 60)}:{timer % 60}</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row pt-20 overflow-auto">
        <div className="w-full md:w-1/2 bg-white p-6">
          <p className="text-2xl font-bold text-gray-800 mb-4">
            <span>Question {currentIndex + 1}</span>
            <br />
            {currentQuestion.question}
          </p>
        </div>

        <div className="w-full md:w-1/2 bg-white pb-32 md:p-6">
          <div className="space-y-6">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 py-4 px-2 bg-gray-200 border border-gray-300 rounded-lg">
                <input
                  type="radio"
                  name={`question-${currentIndex}`}
                  value={option}
                  onChange={() => handleSelectAnswer(option, String.fromCharCode(65 + index))}
                  checked={answers[currentIndex]?.startsWith(String.fromCharCode(65 + index))}
                />
                <span className="text-black text-lg font-semibold">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bottom-0 left-0 right-0 bg-orange-500 text-white py-3 flex justify-between z-30">
        <button onClick={handlePrevious} className={`p-2 px-4 rounded-md font-semibold bg-black ml-2 ${currentIndex === 0 ? "opacity-50" : ""}`} disabled={currentIndex === 0}>
          &lt;&lt; PREVIOUS
        </button>

        <button onClick={handleNext} className={`p-2 px-4 rounded-md font-semibold bg-black mr-3 ${currentIndex === questions.length - 1 ? "opacity-50" : ""}`} disabled={currentIndex === questions.length - 1}>
          NEXT &gt;&gt;
        </button>
      </div>

      {currentIndex === questions.length - 1 && (
        <div className="absolute bottom-20 right-6">
          <button onClick={handleSubmit} className="bg-black text-white font-bold p-2 px-6 rounded-md">
            Submit Test
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default TestPage;