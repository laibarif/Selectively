import React, { useState, useEffect } from "react";
import { useNavigate, useParams  } from "react-router-dom";
import axios from "axios";

function QuestionPage() {
  const { category } = useParams(); // Get the category from the URL
  const [questions, setQuestions] = useState([]); // Store fetched questions
  const [currentIndex, setCurrentIndex] = useState(0); // Track current question index
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(780); // Timer in seconds (13 minutes)
  const [timerEnded, setTimerEnded] = useState(false); // Track if timer ended
  const [answers, setAnswers] = useState([]); // Track selected answers
  const navigate = useNavigate();
 


  useEffect(() => {
    // Fetch questions from API
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/freeassesment/${category}`
        );
        setQuestions(response.data.questions); // Access the correct array of questions
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };
    fetchQuestions();

    // Timer logic
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(countdown);
          setTimerEnded(true); // Set timer as ended
          handleSubmit(); // Submit answers when timer ends
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000); // Update every second

    // Cleanup interval when component unmounts
    return () => clearInterval(countdown);
  }, [category]);

  const handleSelectAnswer = (value, label) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = `${label}: ${value}`; // Store answer as "Correct answer: A"
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
    if (!optionsString) return []; // Handle null or undefined input
    return optionsString.split(",").map((option) => {
      const trimmedOption = option.trim();
      const separatorIndex = trimmedOption.indexOf(" "); // Find the first space between label and value
      if (separatorIndex === -1) {
        return { label: trimmedOption, value: trimmedOption }; // Handle invalid format or no space found
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
        Loading...
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
    // Calculate the score (number of correct answers) for all questions
    const score = questions.reduce((acc, question, index) => {
      const selectedAnswer = answers[index];
      const correctAnswer = question.correct_answer;
  
      // Ensure both values are strings and trim any whitespace
      const normalizedSelectedAnswer = String(selectedAnswer).trim();
      const normalizedCorrectAnswer = String(correctAnswer).trim();
    
      let isCorrect = false;
  
      // Check if the selected answer matches the correct answer
      if (Array.isArray(normalizedSelectedAnswer)) {
        // If multiple answers are allowed, check if every selected answer matches the correct ones
        isCorrect = normalizedSelectedAnswer.every((answer) =>
          normalizedCorrectAnswer.includes(answer)
        );
      } else {
        // If the correct answer is just a single letter (e.g., 'A', 'B'), normalize it
        isCorrect =
          normalizedSelectedAnswer.charAt(0) ===
          normalizedCorrectAnswer.charAt(0);
      }
  
      // Increment the score if the answer is correct
      return isCorrect ? acc + 1 : acc;
    }, 0);
  
     // Determine the appropriate API endpoint based on category
     const endpointMap = {
      "maths": 'submitMathsAssessment',
      "thinking skills": 'submitThinkingSkillsAssessment',
      "reading": 'randomReadingQuestions'
    };
    
    const rawSubject = questions[0]?.subject;
    
    
    // Normalize subject to lowercase and remove extra spaces
    const subject = (rawSubject || "").toLowerCase().trim();
    console.log("Normalized Subject:", subject);
    
    // Ensure the subject exists in endpointMap
    const endpoint = endpointMap[subject];
    
    
    if (!endpoint) {
      console.error("Invalid category");
      return;
    }
    
    if (!endpoint) {
      console.error("Invalid category");
      return; // Exit if the category is not valid
    }
   
    const email = localStorage.getItem('userEmail');
    // Prepare the data to be sent to the backend
    const data = { email, score };
  
    try {
      // Send the score and email to the appropriate backend route
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/${endpoint}`,
        data
      );
      
      // Navigate after successful submission
      navigate("/test-assesment-books");
    } catch (error) {
      console.error("Error submitting assessment score:", error);
    }
  };
  

  return (
    <div className="h-screen bg-white">
      {/* Timer Section */}
      <div className="absolute top-4 right-4 bg-black text-white py-1 px-3 rounded-md">
        <p className="font-bold">{formatTime(timer)}</p>
      </div>
      {/* Content Section */}
      <div className="md:h-4/5 flex-grow flex">
        <div className="w-full flex flex-col md:flex-row border shadow-lg rounded-md overflow-hidden">
          {/* Question Section */}
          <div className="w-full md:w-1/2 bg-gray-50 p-6">
            <p className="w-10/12 py-4 text-lg font-medium text-gray-600 mb-4 text-justify">
              {/* Add the question number */}
              <span className="font-bold text-xl text-black">
                Question {currentIndex + 1}:{" "}
              </span>
              {currentQuestion?.question || "Question not available"}
            </p>
          </div>

          {/* Answer Section */}
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
                    disabled={timerEnded} // Disable options when timer ends
                    onChange={() =>
                      handleSelectAnswer(option.value, option.label)
                    } // Pass label along with value
                    checked={answers[currentIndex]?.includes(option.label)} // Check if the selected answer includes the option label
                  />
                  <span className="text-gray-700 text-sm">{`${option.label}: ${option.value}`}</span>
                </label>
              ))}
            </div>

            <div className="h-auto p-3 flex items-start space-x-2 bg-gray-300 mt-3">
              <div className="text-yellow-500 text-xl p-4">💡</div>
              <p className="text-gray-600 text-sm pt-4">
                <strong>Hint:</strong> <br />
                {currentQuestion?.explanation || "No hint available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="bg-red-600 text-white py-3 flex justify-between">
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

      {/* Redirect button when time's up or last question is reached */}
      {(currentIndex === questions.length - 1 || timerEnded) && (
        <div className="absolute bottom-6 md:bottom-4 right-4">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-4 rounded-md"
          >
            Time's up! Go to Test Assessment Books
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionPage;
