import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../FreeAssesment/loader.css";
import logo from "../../assets/Logo_White - Complete.svg";

function PracticeTestPage() {
    const [questions, setQuestions] = useState([]); // ✅ Ensure default is an empty array
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const isResizing = useRef(false);
    const startX = useRef(0);

    const user = JSON.parse(localStorage.getItem('user'));
    const childId = user?.id || "";
    console.log("childId", childId)

    // ✅ Shuffle function to randomize subjects
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    const handleButtonClick = () => {
        setShowPopup(true);
    };
    const handleCancel = () => {
        setShowPopup(false);
    };

    const handleConfirm = () => {
        setShowPopup(false);
        handleSubmit();
    };
    // ✅ Fetch and shuffle questions
    useEffect(() => {
        const fetchPracticeTest = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/practice-test/getTestQuestions`);

                if (!response.data) {
                    throw new Error("Invalid API response structure.");
                }

                // ✅ Shuffle subjects order
                let subjects = [
                    { category: "reading", questions: response.data.reading || [] },
                    { category: "maths", questions: response.data.maths || [] },
                    { category: "thinkingskills", questions: response.data.thinkingskills || [] },
                ];

                subjects = shuffleArray(subjects);
                subjects.push({ category: "writing", questions: [response.data.writing] }); // ✅ Writing always at the end

                // ✅ Flatten questions while preserving the shuffled subject order
                const flattenedQuestions = subjects.flatMap((subject) =>
                    subject.questions.map((q) => ({ ...q, category: subject.category }))
                );

                setQuestions(flattenedQuestions);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching practice test questions:", error);
                setLoading(false);
                toast.error("Failed to load practice test.");
            }
        };

        fetchPracticeTest();
    }, []);

    const handleSubmit = async () => {
        setIsLoading(true);

        if (!questions.length) {
            toast.error("No questions to submit.");
            return;
        }

        console.log("Submitting Answers:", answers);

        try {
            const categories = ["reading", "maths", "thinkingskills", "writing"];
            const sections = [];

            for (const category of categories) {
                const categoryQuestions = questions.filter(q => q.category === category);

                if (categoryQuestions.length === 0) continue; // Skip if no questions exist for this category

                let responses = [];
                if (category === "writing") {
                    const writingResponse = answers.writing?.trim() || "";
                    if (!writingResponse.trim()) {
                        toast.error("Writing response is empty.");
                        continue;
                    }

                    responses.push({
                        questionId: categoryQuestions[0]?.id || 1, // Default to 1 if no ID
                        writingResponse: writingResponse
                    });
                } else {
                    responses = categoryQuestions.map(q => ({
                        questionId: q.id,
                        selectedAnswer: answers[category]?.[q.id] || ""
                    }));
                }

                sections.push({
                    category,
                    questionStatus: categoryQuestions.map(q => ({
                        questionId: q.id,
                        status: answers[category]?.[q.id] ? "attempted" : "unattempted"
                    })),
                    responses
                });
            }

            const payload = {
                childId,
                testType: "Practice",
                sections
            };

            console.log("Submitting Payload:", payload);

            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/practice-test/submitPracticeTest`, payload, {
                headers: { "Content-Type": "application/json" }
            });

            navigate("/student-dashboard");
        } catch (error) {
            toast.error("Error submitting test.");
            console.error("Submission Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || questions.length === 0) {
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

    const totalQuestions = questions.length;
    const currentQuestion = questions[currentIndex];

    // ✅ Handle Answer Selection
    // const handleSelectAnswer = (selectedAnswer) => {
    //     setAnswers((prev) => ({
    //         ...prev,
    //         [currentQuestion.category]: {
    //             ...(prev[currentQuestion.category] || {}),
    //             [currentIndex]: selectedAnswer
    //         }
    //     }));
    // };
    const handleSelectAnswer = (questionId, selectedAnswer, category) => {
        setAnswers(prev => {
            const updatedAnswers = { ...prev };

            if (!updatedAnswers[category]) {
                updatedAnswers[category] = {};  // Ensure the category exists
            }

            updatedAnswers[category][questionId] = selectedAnswer; // Store answer

            console.log("Updated Answers:", updatedAnswers); // Debugging Log

            return updatedAnswers;
        });
    };

    // Handle Writing Answer
    const handleWritingAnswer = (event) => {
        const inputText = event.target.value;
        const wordCount = inputText.trim().split(/\s+/).length;

        if (wordCount > 300) {
            toast.error("Your response is too long. Please limit to 300 words.");
            return;
        }

        setAnswers((prev) => ({
            ...prev,
            writing: inputText
        }));

    };

    const handleMouseDown = (e) => {
        isResizing.current = true;
        startX.current = e.clientX;
        document.body.style.cursor = "col-resize";
    };

    return (
        <div className="h-screen bg-white flex flex-col">
            <div className="absolute w-full h-24 flex justify-between items-center py-1 px-3 bg-white shadow-md">
                <img src={logo} alt="logo" className="h-24 w-32" />
            </div>

            <div className="flex-grow flex flex-col md:flex-row pt-20 overflow-hidden">
                <div className="w-full md:w-1/2 bg-white p-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                    <p className="text-2xl font-bold text-gray-800 mb-4">
                        <span>Question {currentIndex + 1}</span>
                        <br />
                        {currentQuestion?.question || "No question available"}
                    </p>

                    {currentQuestion?.extract_text && (
                        <p className="text-black mt-2">
                            <strong>Extract:</strong> {currentQuestion.extract_text}
                        </p>
                    )}

                    {currentQuestion?.image_data && (
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
                        </div>
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

                {/* ✅ MCQ Options */}
                <div className="w-full md:w-1/2 bg-white pb-32 md:p-6">
                    <div className="space-y-6 mt-10">
                        {currentQuestion.category === "writing" ? (
                            // ✅ Show writing input instead of MCQs
                            <textarea
                                className="w-full p-2 border rounded"
                                rows="5"
                                placeholder="Write your answer here..."
                                onChange={handleWritingAnswer}
                            ></textarea>
                        ) : (
                            // ✅ Show MCQs
                            currentQuestion?.mcq_options?.split(/,\s*|\r\n|\n/).map((option, index) => (
                                <label key={index} className="flex items-center space-x-2 py-4 px-2 bg-gray-200 border border-gray-300 rounded-lg">
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option}
                                        className="peer h-8 w-8"
                                        onChange={() => handleSelectAnswer(currentQuestion.id, option, currentQuestion.category)}
                                        checked={answers[currentQuestion.category]?.[currentQuestion.id] === option}
                                    />
                                    <span className="text-black text-lg font-semibold">{option}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Navigation Buttons */}
            <div className="relative bottom-0 left-0 right-0 bg-orange-500 text-white py-3 flex justify-between">
                <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    className={`p-2 px-4 rounded-md font-semibold bg-black ml-2 ${currentIndex === 0 ? "opacity-50" : ""}`}
                    disabled={currentIndex === 0}
                >
                    &lt;&lt; PREVIOUS
                </button>

                {currentIndex < totalQuestions - 1 ? (
                    <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="p-2 px-4 rounded-md font-semibold bg-black mr-3"
                    >
                        NEXT &gt;&gt;
                    </button>
                ) : (
                    <button
                        onClick={handleButtonClick}
                        className="bg-black text-white font-bold p-2 px-6 mr-3 rounded-md"
                    >
                        Submit Practice Test!
                    </button>
                )}
            </div>

            {/* ✅ Submission Confirmation Popup */}
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
            {isLoading && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                    <span className="ml-4 text-white">
                        Sending Result on Parent email address...
                    </span>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default PracticeTestPage;
