import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loader.css";
function QuestionPage() {
  const { category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(780);
  const [timer, setTimer] = useState(timerRef.current);
  const [timerEnded, setTimerEnded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/freeassesment/${category}`
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
  }, [category]);

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

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
    return optionsString.split(",").map((option) => {
      const trimmedOption = option.trim();
      const separatorIndex = trimmedOption.indexOf(" ");
      if (separatorIndex === -1) {
        return { label: trimmedOption, value: trimmedOption };
      }
      const label = trimmedOption.substring(0, separatorIndex).trim();
      const value = trimmedOption.substring(separatorIndex + 1).trim();
      return { label, value };
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div class="loadingspinner">
          <div id="square1"></div>
          <div id="square2"></div>
          <div id="square3"></div>
          <div id="square4"></div>
          <div id="square5"></div>
        </div>
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

  const currentQuestion = questions[currentIndex] || {
    question: "Question not available",
    mcq_options: ""
  };
  const options = parseOptions(currentQuestion.mcq_options);

  const handleSubmit = async () => {
    // Calculate the score and prepare question status
    const questionStatus = questions.map((question, index) => {
      const selectedAnswer = answers[index];
      const correctAnswer = question.correct_answer;

      const normalizedSelectedAnswer = String(selectedAnswer).trim();
      const normalizedCorrectAnswer = String(correctAnswer).trim();

      let isCorrect = false;

      if (Array.isArray(normalizedSelectedAnswer)) {
        isCorrect = normalizedSelectedAnswer.every((answer) =>
          normalizedCorrectAnswer.includes(answer)
        );
      } else {
        isCorrect =
          normalizedSelectedAnswer.charAt(0) ===
          normalizedCorrectAnswer.charAt(0);
      }

      return {
        questionNumber: index + 1, // Generate question number dynamically
        status: selectedAnswer ? "attempted" : "unattempted"
      };
    });

    // Calculate the score
    const score = questionStatus.reduce((acc, item, index) => {
      const selectedAnswer = answers[index];
      const correctAnswer = questions[index].correct_answer;

      const normalizedSelectedAnswer = String(selectedAnswer).trim();
      const normalizedCorrectAnswer = String(correctAnswer).trim();

      let isCorrect = false;

      if (Array.isArray(normalizedSelectedAnswer)) {
        isCorrect = normalizedSelectedAnswer.every((answer) =>
          normalizedCorrectAnswer.includes(answer)
        );
      } else {
        isCorrect =
          normalizedSelectedAnswer.charAt(0) ===
          normalizedCorrectAnswer.charAt(0);
      }

      return isCorrect ? acc + 1 : acc;
    }, 0);

    // Map subject to endpoints
    const endpointMap = {
      maths: "submitMathsAssessment",
      "thinking skills": "submitThinkingSkillsAssessment",
      reading: "randomReadingQuestions"
    };

    const rawSubject = questions[0]?.subject;
    const subject = (rawSubject || "").toLowerCase().trim();
    const endpoint = endpointMap[subject];

    if (!endpoint) {
      console.error("Invalid category");
      return;
    }

    const email = localStorage.getItem("userEmail");

    const data = { email, score, questionStatus };

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/${endpoint}`,
        data
      );

      navigate("/test-assesment-books");
    } catch (error) {
      toast.error("Error submitting assessment:", error);
    }
  };
 
  return (
    <div className="h-auto  bg-white ">
      <div className="absolute top-28 right-6 bg-black text-white py-1 px-3 rounded-md">
        <p className="font-bold">{formatTime(timer)} Time remaining !</p>
      </div>
      <div className="md:h-4/5 flex-grow flex">
        <div className="w-full flex flex-col md:flex-row rounded-md overflow-hidden">
          <div className="w-full md:w-1/2 bg-gray-50 p-6">
            <p className="w-10/12 py-4 text-lg font-medium text-gray-600 mb-4 text-justify">
              <span className="font-bold text-xl text-black">
                Question {currentIndex + 1}:{" "}
              </span>
              {currentQuestion?.question || "Question not available"}
            </p>

            <div>
              {currentQuestion.image_data && (
                <img
                  src={currentQuestion.image_data}
                  loading="lazy"
                  alt="Question Image"
                  className="w-40 h-40"
                />
              )}
            </div>
            {currentQuestion?.image_description && (
              <p className="text-gray-600 italic mt-2">
                {currentQuestion.image_description}
              </p>
            )}
          </div>

          <div className="w-full md:w-1/2 bg-gray-100 p-6 border-l">
            <div className="space-y-6">
              {options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-2 py-4 px-2 hover:bg-gray-300"
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={option.value}
                    className="peer h-5 w-5 text-red-600 border-gray-300 focus:ring-red-500"
                    disabled={timerEnded}
                    onChange={() =>
                      handleSelectAnswer(option.value, option.label)
                    }
                    checked={
                      answers[currentIndex]?.startsWith(option.label) || false
                    }
                  />
                  <span className="text-gray-700 text-sm">{`${option.label}: ${option.value}`}</span>
                </label>
              ))}
            </div>

            <div className="h-auto p-3 flex items-start space-x-2 bg-gray-300 mt-3 mb-10">
              <div className="text-yellow-500 text-xl p-4">💡</div>
              <p className="text-gray-600 text-sm pt-4">
                <strong>Hint:</strong> <br />
                {currentQuestion?.explanation || "No hint available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className=" md:fixed md:bottom-0 md:left-0 md:right-0  bg-red-600 text-white py-3 flex justify-between">
        <button
          onClick={handlePrevious}
          className={`hover:bg-red-600 p-2 rounded-md flex justify-start pl-6 font-semibold ${
            currentIndex === 0 || timerEnded
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={currentIndex === 0 || timerEnded}
        >
          &lt;&lt; PREVIOUS
        </button>
        <button
          onClick={handleNext}
          className={`hover:bg-red-600 p-2 rounded-md flex justify-end pr-6 font-semibold ${
            currentIndex === questions.length - 1 || timerEnded
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={currentIndex === questions.length - 1 || timerEnded}
        >
          NEXT &gt;&gt;
        </button>
      </div>

      {(currentIndex === questions.length - 1 || timerEnded) && (
        <div className="fixed bottom-6  right-0  md:bottom-16">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-4 rounded-md"
          >
            {timerEnded
              ? "Time's up! Go to Test Assessment Books"
              : "Finish Question! Go to Test Assessment Books"}
          </button>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default QuestionPage;
