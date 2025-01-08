import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./loader.css";
import logo from "../../assets/Logo_White - Complete.svg";
function QuestionPage() {
  const { category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(780);
  const [timer, setTimer] = useState(timerRef.current);
  const [timerEnded, setTimerEnded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  const [leftWidth, setLeftWidth] = useState(50);
  const [rightWidth, setRightWidth] = useState(50);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const [isLaptop, setIsLaptop] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  const handleButtonClick = () => {
    setShowPopup(true); // Show the confirmation popup
  };

  const handleCancel = () => {
    setShowPopup(false); // Close the popup without doing anything
  };

  const handleConfirm = () => {
    setShowPopup(false); // Close the popup
    handleSubmit(); // Call the submit function
  };
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
    const checkScreenSize = () => {
      setIsLaptop(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleSubmit = async () => {
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
        questionNumber: index + 1,
        status: selectedAnswer ? "attempted" : "unattempted"
      };
    });

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
      // Make the API request
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/${endpoint}`,
        data
      );
    
      // Navigate to the test assessment books page
      navigate("/test-assesment-books");
    
      // Clear localStorage after the API call is done
      localStorage.removeItem('timer-randomReadingQuestions');
localStorage.removeItem('timestamp-randomReadingQuestions');
localStorage.removeItem('timer-randomMathsQuestions');
localStorage.removeItem('timestamp-randomMathsQuestions');
localStorage.removeItem('timer-randomThinkingskillQuestions');
localStorage.removeItem('timestamp-randomThinkingskillQuestions');

    
    } catch (error) {
      // Handle any errors that occur during the API request
      toast.error("Error submitting assessment:", error);
    }
    
  };


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
  const response = await axios.get(
    `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/${category}`,
    {
      headers: {
        "Accept": "application/json; charset=utf-8",
      },
    }
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
    const savedTime = localStorage.getItem(`timer-${category}`);
    const savedTimestamp = localStorage.getItem(`timestamp-${category}`);

    if (savedTime && savedTimestamp) {
      const elapsedTime = Math.floor((Date.now() - parseInt(savedTimestamp, 10)) / 1000);
      const remainingTime = Math.max(parseInt(savedTime, 10) - elapsedTime, 0);
      setTimer(remainingTime);

      if (remainingTime === 0) {
        setTimerEnded(true);
      }
    }

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(countdown);
          setTimerEnded(true);
          return 0;
        }
        const newTime = prevTimer - 1;

        // Save the updated timer value and timestamp to localStorage
        localStorage.setItem(`timer-${category}`, newTime.toString());
        localStorage.setItem(`timestamp-${category}`, Date.now().toString());

        return newTime;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [category]);


  useEffect(() => {
    if (timerEnded) {
      handleSubmit();
    }
  }, [timerEnded]);

  const handleMouseDown = (e) => {
    isResizing.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (isResizing.current) {
      const diff = e.clientX - startX.current;
      const newLeftWidth = Math.max(
        20,
        Math.min(80, leftWidth + (diff / window.innerWidth) * 100)
      );
      const newRightWidth = 100 - newLeftWidth;

      setLeftWidth(newLeftWidth);
      setRightWidth(newRightWidth);
      startX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
  };
  useEffect(() => {
    if (isLaptop) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isLaptop, leftWidth]);

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

  // const parseExtracts = (extractText) => {
  //   if (!extractText) return [];
  
  //   return extractText.split("\n\n").map((extract) => {
  //     // Split the extract into title (e.g., "Extract A") and the rest
  //     const [title, ...paragraphs] = extract.split("\n");
  //     return {
  //       title: title.trim(),
  //       paragraphs: paragraphs.map((para) => para.trim()).filter(Boolean), // Remove empty lines
  //     };
  //   });
  // };

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];
  
    // Step 1: Clean the string by replacing newlines with a space and trimming any extra spaces.
    const cleanedString = optionsString
      .replace(/\n/g, ' ')        // Replace newline characters with spaces
      .trim();                    // Trim any extra spaces at the start or end
  
    // Step 2: Split the string by commas, keeping spaces between labels and values.
    const options = cleanedString.split(/\s*,\s*/).map((option) => {
      const trimmedOption = option.trim();
  
      // Step 3: Match the pattern for options like A) or A followed by a space and value
      const regex = /^([A-E])(\)|\s)(.*)$/; // Match options like A) or A followed by a space
      const match = trimmedOption.match(regex);
  
      if (match) {
        const label = match[1];           // The label (A, B, C, D, E)
        const value = match[3].trim();    // The value (Zoe is 10, David is 5, etc.)
  
        return { label, value };
      }
  
      // If no match found, return the raw option text (this shouldn't usually happen with the correct format).
      return { label: trimmedOption, value: trimmedOption };
    });
  
    return options;
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
 // const extracts = parseExtracts(currentQuestion.extract_text);
  const options = parseOptions(currentQuestion.mcq_options);

 


console.log(currentQuestion)
  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="absolute w-full h-24 flex justify-between items-center py-1 px-3 rounded-md bg-white shadow-md z-10">
        <img src={logo} alt="img-logo" className="h-24 w-32" />
        <p className="font-bold text-white my-auto bg-black px-4 py-2 rounded-md">
          {formatTime(timer)} Time remaining!
        </p>
      </div>

      {/* Main Content Section */}
      <div className="flex-grow flex flex-col md:flex-row pt-20 overflow-auto">
        {/* Left Panel */}

        <div
          className="w-full md:w-1/2 bg-white p-6 pt-10  "
          style={
            window.innerWidth >= 768
              ? { width: `${leftWidth}%`, minHeight: "calc(100vh - 80px)" }
              : {}
          }
        >
          <p className="w-10/12 py-4 text-2xl font-bold space-y-10 text-gray-800 mb-4 text-justify">
            <span className="font-bold text-2xl text-black">
              Question {currentIndex + 1}<br/>
            </span>
            {currentQuestion?.question || "Question not available"}
          </p>

          {currentQuestion?.image_data && (
            <img
            src={`data:image/jpeg;base64,${currentQuestion.image_data}`}
              loading="lazy"
              alt="Question Image"
              className="w-40 h-40 mb-4"
            />
          )}

          {currentQuestion?.image_description && (
            <p className="text-black  mt-2 text-bold">
              {currentQuestion.image_description}
            </p>
          )}



{currentQuestion?.extract_text && (
            <p className="text-black  mt-2 text-bold">
              {currentQuestion.extract_text}
            </p>
          )}
           {/* {
        extracts.map((extract, index) => (
          <p key={index} className="mb-6">
            <h1 className="text-2xl">{extract.title}</h1>
            {extract.paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-black mt-2">
                {paragraph}
              </p>
            ))}
          </p>
        ))
       } */}
        </div>

        <div
          className="resize-handle hidden md:block"
          onMouseDown={handleMouseDown}
          style={{
            cursor: "col-resize",
            backgroundColor: "gray",
            width: "3px",
            height:"auto"
          }}
        ></div>

        {/* Right Panel */}
        <div
          className="w-full md:w-1/2 bg-white pb-32 md:p-6 md:pt-10 "
          style={
            window.innerWidth >= 768
              ? { width: `${rightWidth}%`, minHeight: "calc(100vh - 80px)" }
              : {}
          }
        >
          <div className="space-y-6">
            {options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 py-4 px-2 bg-gray-200  border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${currentIndex}`}
                  value={option.value}
                  className="peer h-8 w-8 focus:ring-yellow-600  border-gray-300 "
                  disabled={timerEnded}
                  onChange={() =>
                    handleSelectAnswer(option.value, option.label)
                  }
                  checked={
                    answers[currentIndex]?.startsWith(option.label) || false
                  }
                />
                <span className="text-black text-lg font-semibold">
                  {`${option.value}`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="relative bottom-0 left-0 right-0 bg-orange-500 text-white py-3 flex justify-between z-30">
  <button
    onClick={handlePrevious}
    className={`p-2 rounded-md font-semibold ${
      currentIndex === 0 || timerEnded ? "opacity-50 cursor-not-allowed" : ""
    }`}
    disabled={currentIndex === 0 || timerEnded}
  >
    &lt;&lt; PREVIOUS
  </button>
  
  <button
    onClick={handleNext}
    className={`p-2 rounded-md font-semibold ${
      currentIndex === questions.length - 1 || timerEnded
        ? "opacity-50 cursor-not-allowed"
        : ""
    } ${currentIndex === questions.length - 1 ? "left sm:mx-auto" : ""}`}
    disabled={currentIndex === questions.length - 1 || timerEnded}
  >
    NEXT &gt;&gt;
  </button>
</div>


      {/* Submit Button */}
      <div>
        {(currentIndex === questions.length - 1 || timerEnded) &&
          !timerEnded && (
            <div className="absolute bottom-20 sm:bottom-4 right-6 z-30">
              <button
                onClick={handleButtonClick}
                className="bg-gradient-to-r from-yellow-500 via-orange-600 to-yellow-700 text-white font-bold py-2 px-6 rounded-md shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
              >
                Finish Question! Go to Test Assessment Books
              </button>
            </div>
          )}

        {/* Popup for confirmation */}
        {showPopup && (
  <div id="YOUR_ID" className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div
      className="relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all w-full max-w-md sm:mx-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {/* Close Button */}
      <button
        onClick={handleCancel}
        type="button"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Modal Content */}
      <div className="px-6 py-8">
        {/* Icon and Header */}
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3
            className="text-lg font-semibold text-gray-900"
            id="modal-headline"
          >
            Confirm Submission
          </h3>
        </div>

        {/* Message */}
        <div className="mt-4 text-gray-700">
          Are you sure you want to submit the result? Please confirm your action below.
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            type="button"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      </div>

      <ToastContainer />
    </div>
  );
}

export default QuestionPage;
