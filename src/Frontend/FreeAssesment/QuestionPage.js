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
  // const timerRef = useRef(720);
  // const [timer, setTimer] = useState(timerRef.current);
  const [timerEnded, setTimerEnded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  const categoryTimers = {
    randomReadingQuestions: 13 * 60, // 13 minutes
    randomMathsQuestions: 12 * 60, // 12 minutes
    randomThinkingskillQuestions: 10 * 60, // 10 minutes
  };

  // Get the timer value based on the category, default to 12 minutes if not found
  const initialTime = categoryTimers[category] || 12 * 60;

  const timerRef = useRef(initialTime);
  const [timer, setTimer] = useState(timerRef.current);

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
        status: selectedAnswer ? "attempted" : "unattempted",
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
      reading: "randomReadingQuestions",
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
      localStorage.removeItem("timer-randomReadingQuestions");
      localStorage.removeItem("timestamp-randomReadingQuestions");
      localStorage.removeItem("timer-randomMathsQuestions");
      localStorage.removeItem("timestamp-randomMathsQuestions");
      localStorage.removeItem("timer-randomThinkingskillQuestions");
      localStorage.removeItem("timestamp-randomThinkingskillQuestions");
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
              Accept: "application/json; charset=utf-8",
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
      const elapsedTime = Math.floor(
        (Date.now() - parseInt(savedTimestamp, 10)) / 1000
      );
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

  const formatExtractText = (text) => {
    if (!text) return "";

    // Regex to match "Extract A", "Text A", "Extract B", "Text B", etc.
    const extractRegex = /\b(Extract\s+[A-Z]|Text\s+[A-Z])\b/g;

    // Format the Extract/Text but keep punctuation marks intact
    const formattedText = text.replace(
      extractRegex,
      (match) => `<br><br><b>${match}</b><br>`
    );

    // Split the text by new lines to handle poem structure
    const lines = formattedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // The first part should be "Read the poem and answer the questions", which should be bold and on one line
    const introText = `<p><strong>${lines[0]}</strong></p>`;

    // Ensure there is a second line before checking for "Poem"
    let poemLabel = "";
    if (lines.length > 1 && lines[1].toLowerCase().startsWith("poem")) {
      poemLabel = `<p><strong>${lines[1]}</strong></p>`; // Only format "Poem" if it's in the second line
    }

    // The remaining part is the poem text, which should be split into individual lines
    const poemContent = lines
      .slice(poemLabel ? 2 : 1)
      .map((line) => `<p><strong>${line}</strong></p>`)
      .join("");

    // Return the formatted text with Extract/Text formatted and poem properly structured
    return introText + poemLabel + poemContent;
  };

  const parseOptions = (optionsString) => {
    if (!optionsString) return [];

    // Step 1: Normalize the string by replacing newlines with spaces and trimming spaces
    const cleanedString = optionsString
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();

    // Step 2: Check if the input matches "A, B, C, D" or similar pattern
    if (/^[A-E](,\s*[A-E])*$/.test(cleanedString)) {
      return cleanedString.split(",").map((label) => ({
        label: label.trim(),
        value: label.trim(), // Use the label itself as the value
      }));
    }

    // Step 3: Split the string using labels A, B, C, D, E followed by specific patterns
    const options = cleanedString
      .split(/(?=\b[A-E]\b)/) // Split at each label (A, B, C, D, E) when it's a whole word
      .map((option) => {
        const trimmedOption = option.trim();

        // Step 4: Match the label (A, B, C, D, E) and its value
        const regex = /^([A-E])\s*(Extract\s+[A-E].*|.*)$/; // Match "Extract X" or any other value
        const match = trimmedOption.match(regex);

        if (match) {
          const label = match[1]; // Extract the label (A, B, C, D, E)
          let value = match[2]?.trim() || ""; // Extract value or default to empty

          // Ensure "Extract A" format for consistency
          if (value.toLowerCase().startsWith("extract")) {
            value = `Extract ${label}`;
          }

          // Handle the case where value is empty
          if (!value || value === label) {
            value = `Extract ${label}`; // Default to "Extract X" if no specific value exists
          }

          return { label, value };
        }

        // Handle invalid or improperly formatted options
        return { label: "Invalid", value: trimmedOption };
      });

    // Remove duplicate options
    const uniqueOptions = [];
    const seenLabels = new Set();

    options.forEach((option) => {
      if (!seenLabels.has(option.label)) {
        uniqueOptions.push(option);
        seenLabels.add(option.label);
      }
    });

    return uniqueOptions;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsLeft = seconds % 60;

    return {
      hours: hours < 10 ? `0${hours}` : `${hours}`,
      minutes: minutes < 10 ? `0${minutes}` : `${minutes}`,
      seconds: secondsLeft < 10 ? `0${secondsLeft}` : `${secondsLeft}`,
    };
  };

  const { hours, minutes, seconds } = formatTime(timer);

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
    mcq_options: "",
  };
  const extracts = formatExtractText(currentQuestion.extract_text);
  const options = parseOptions(currentQuestion.mcq_options);
console.log("quston",questions)
  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="absolute w-full h-24 flex justify-between items-center py-1 px-3 rounded-md bg-white shadow-md z-10">
        <img src={logo} alt="img-logo" className="h-24 w-32" />
        <div className="flex justify-center items-center bg-black text-white text-xl font-bold p-1  shadow-lg">
          <div className="flex flex-col items-center mx-2">
            {/* <span>{hours}</span>
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              Hour
            </span> */}
          </div>
          {/* <span className="text-4xl mx-2">:</span> */}
          <div className="flex flex-col items-center mx-2">
            <span>{minutes}</span>
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              Min
            </span>
          </div>
          <span className="text-4xl mx-2">:</span>
          <div className="flex flex-col items-center mx-2">
            <span>{seconds}</span>
            <span className="text-sm text-gray-400 uppercase tracking-wide">
              Sec
            </span>
          </div>
        </div>
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
          {category !== "randomReadingQuestions" && (
            <>
              <p className="w-10/12 py-4 text-2xl font-bold text-gray-800 mb-4 text-justify">
                <span className="font-bold text-2xl text-black">
                  Question {currentIndex + 1}
                </span>
                <span style={{ display: "block", marginTop: "0.8rem" }}>
                  {currentQuestion?.question || "Question not available"}
                </span>
              </p>

              {/* Conditionally render the Image */}
              {currentQuestion.image_data && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={
                      currentQuestion.image_data?.startsWith("http")
                        ? currentQuestion.image_data
                        : `http://${currentQuestion.image_data}` // Adjust this as needed
                    }
                    alt={currentQuestion.image_description || "Question image"}
                    className="object-cover border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {currentQuestion?.image_description && (
                <p className="text-black mt-2 text-2xl">
                  {currentQuestion.image_description}
                </p>
              )}
            </>
          )}

          {currentQuestion?.extract_text && (
            <p
              className="text-black mt-2"
              dangerouslySetInnerHTML={{
                __html: formatExtractText(currentQuestion.extract_text),
              }}
            ></p>
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
            height: "auto",
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
          {category == "randomReadingQuestions" && (
            <>
              <p className="w-10/12 py-4 text-2xl font-bold text-gray-800 mb-4 text-justify">
                <span className="font-bold text-2xl text-black">
                  Question {currentIndex + 1}
                </span>
                <span style={{ display: "block", marginTop: "0.8rem" }}>
                  {currentQuestion?.question || "Question not available"}
                </span>
              </p>

              {/* Conditionally render the Image */}
              {currentQuestion.image_data && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={
                      currentQuestion.image_data?.startsWith("http")
                        ? currentQuestion.image_data
                        : `http://${currentQuestion.image_data}` // Adjust this as needed
                    }
                    alt={currentQuestion.image_description || "Question image"}
                    className="object-cover border border-gray-300 rounded-md"
                  />
                </div>
              )}

              {currentQuestion?.image_description && (
                <p className="text-black mt-2 text-2xl">
                  {currentQuestion.image_description}
                </p>
              )}
            </>
          )}

          <div className="space-y-6">
            {options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 py-4 px-2 bg-gray-200 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${currentIndex}`}
                  value={option.value}
                  className="peer h-8 w-8 focus:ring-yellow-600 border-gray-300"
                  disabled={timerEnded}
                  onChange={() =>
                    handleSelectAnswer(option.value, option.label)
                  }
                  checked={
                    answers[currentIndex]?.startsWith(option.label) || false
                  }
                />
                <span className="text-black text-lg font-semibold">
                  {` ${option.value}`} {/* Combine label and value */}
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
          className={`p-2 px-4 rounded-md font-semibold bg-black ml-2 ${
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
          className={`p-2 px-4 rounded-md font-semibold bg-black mr-3 ${
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
            <div className="absolute bottom-20 sm:bottom-3 right-6 z-30">
              <button
                onClick={handleButtonClick}
                className="bg-black text-white font-bold p-2 px-6 rounded-md shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
              >
                Submit! Go to Test Assessment Books
              </button>
            </div>
          )}

        {/* Popup for confirmation */}
        {showPopup && (
          <div
            id="YOUR_ID"
            className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
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
                  Are you sure you want to submit the result? Please confirm
                  your action below.
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
