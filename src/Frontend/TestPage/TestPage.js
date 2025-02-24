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
    const isResizing = useRef(false);
    const startX = useRef(0);

    const user = JSON.parse(localStorage.getItem('user'));
    const childId = user?.id || "";
    console.log("childId", childId)

    const testTimers = {
        "practice-test": 10 * 60,
        "weekly-test": 20 * 60,
        "mega-test": 30 * 60,
    };
    const handleMouseDown = (e) => {
        isResizing.current = true;
        startX.current = e.clientX;
        document.body.style.cursor = "col-resize";
    };
    const initialTime = testTimers[testType] || 0;
    const timerRef = useRef(initialTime);
    const [timer, setTimer] = useState(timerRef.current);

    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        const preventBackNavigation = () => {
            window.history.pushState(null, null, window.location.pathname);
            alert("Back navigation is disabled during the test.");
        };

        window.addEventListener("popstate", preventBackNavigation);
        return () => window.removeEventListener("popstate", preventBackNavigation);
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/test/subject-test/${category}`
                );
                console.log("Respone", response)
                if (!response.data || !Array.isArray(response.data.questions)) {
                    throw new Error("Invalid API response. Questions not found.");
                }

                setQuestions(response.data.questions);
                setAnswers(new Array(response.data.questions.length).fill(null));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
                toast.error("Failed to load questions. Please try again.");
            }
        };

        fetchQuestions();
    }, [category]);

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

    useEffect(() => {
        if (testType !== "subject-test" && timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 0) {
                        clearInterval(countdown);
                        setTimerEnded(true);
                        handleSubmit();
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [timer, testType]);

    const handleSelectAnswer = (value) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentIndex] = {
            questionId: questions[currentIndex].id,
            selectedAnswer: value,
        };
        setAnswers(updatedAnswers);
    };

    // ✅ Correct API request with structured responses
    const handleSubmit = async () => {
        if (!questions.length) {
            toast.error("No questions to submit.");
            return;
        }

        const questionStatus = questions.map((_, index) => ({
            questionNumber: index + 1,
            status: answers[index] ? "attempted" : "unattempted",
        }));

        const score = answers.reduce((acc, ans, index) => {
            return ans?.selectedAnswer?.charAt(0) === questions[index]?.correct_answer?.charAt(0) ? acc + 1 : acc;
        }, 0);

        const payload = {
            childId,
            category,
            testType,
            score,
            questionStatus,
            responses: answers.filter(ans => ans !== null) // Ensure responses are sent
        };

        console.log("Submitting payload:", payload); // ✅ Log to check before API call

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/test/subject-test/submit`, payload);
            toast.success("Test submitted successfully!");
            setTimeout(() => navigate("/student-dashboard"), 2000);
        } catch (error) {
            toast.error("Error submitting test.");
            console.error("Submission Error:", error);
        }
    };


    // const handleSelectAnswer = (value, label) => {
    //     const updatedAnswers = [...answers];
    //     updatedAnswers[currentIndex] = `${label}: ${value}`;
    //     setAnswers(updatedAnswers);
    // };

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
                <div className="loadingspinner">
                    <div id="square1"></div>
                    <div id="square2"></div>
                    <div id="square3"></div>
                    <div id="square4"></div>
                    <div id="square5"></div>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>No questions found. Please try again later.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="h-screen bg-white flex flex-col">
            <div className="absolute w-full h-24 flex justify-between items-center py-1 px-3 rounded-md bg-white shadow-md z-10">
                <img src={logo} alt="logo" className="h-24 w-32" />

                {/* Show timer only if NOT a subject test */}
                {testType !== "subject-test" && (
                    <div className="flex justify-center items-center bg-black text-white text-xl font-bold p-1 shadow-lg">
                        <span>
                            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-grow flex flex-col md:flex-row pt-20 overflow-hidden">
                <div className="w-full md:w-1/2 bg-white p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <p className="text-2xl font-bold text-gray-800 mb-4">
                        <span>Question {currentIndex + 1}</span>
                        <br />
                        {currentQuestion.question}
                    </p>

                    {currentQuestion.image_data && (
                        <div className="mt-4">
                            <img
                                src={
                                    currentQuestion.image_data.startsWith("http")
                                        ? currentQuestion.image_data
                                        : `http://${currentQuestion.image_data}`
                                }
                                alt="Question Image"
                                className="max-w-full rounded-md shadow-lg"
                            />
                            {currentQuestion.image_description && (
                                <p className="text-gray-600 text-xl pt-4">  {/* Added margin-top */}
                                    {currentQuestion.image_description}
                                </p>
                            )}
                        </div>

                    )}
                    {currentQuestion?.text && (
                        <p
                            className="text-black mt-2"
                            dangerouslySetInnerHTML={{
                                __html: formatExtractText(currentQuestion.text),
                            }}
                        ></p>
                    )}
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


                <div className="w-full md:w-1/2 bg-white pb-32 md:p-6">
                    <div className="space-y-6">
                        {currentQuestion.mcq_options
                            ?.split(/,\s*|\r\n|\n/)
                            .map((option, index) => (
                                <label
                                    key={index}
                                    className="flex items-center space-x-2 py-4 px-2 bg-gray-200 border border-gray-300 rounded-lg"
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentIndex}`}
                                        value={option}
                                        className="peer h-8 w-8 focus:ring-yellow-600 border-gray-300"
                                        onChange={() => handleSelectAnswer(option, String.fromCharCode(65 + index))}
                                        checked={answers[currentIndex]?.selectedAnswer === option}
                                    />
                                    <span className="text-black text-lg font-semibold">{option}</span>
                                </label>
                            ))}
                    </div>
                </div>
            </div>

            <div className="relative bottom-0 left-0 right-0 bg-orange-500 text-white py-3 flex justify-between z-30">
                <button
                    onClick={handlePrevious}
                    className={`p-2 px-4 rounded-md font-semibold bg-black ml-2 ${currentIndex === 0 ? "opacity-50" : ""
                        }`}
                    disabled={currentIndex === 0}
                >
                    &lt;&lt; PREVIOUS
                </button>

                <button
                    onClick={handleNext}
                    className={`p-2 px-4 rounded-md font-semibold bg-black mr-3 ${currentIndex === questions.length - 1 ? "opacity-50" : ""
                        }`}
                    disabled={currentIndex === questions.length - 1}
                >
                    NEXT &gt;&gt;
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-black text-white font-bold p-2 px-6 rounded-md shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
                >
                    Submit! Go to Test Assessment Books
                </button>
            </div>

            <ToastContainer />
        </div>
    );
}

export default TestPage;
