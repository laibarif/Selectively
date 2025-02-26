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
    const navigate = useNavigate();
    const isResizing = useRef(false);
    const startX = useRef(0);

    // ✅ Shuffle function to randomize subjects
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    // ✅ Fetch and shuffle questions
    useEffect(() => {
        const fetchPracticeTest = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/test/practice-test`);

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

    // ✅ Prevent accessing questions before data is ready
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
    const handleSelectAnswer = (selectedAnswer) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.category]: {
                ...(prev[currentQuestion.category] || {}),
                [currentIndex]: selectedAnswer
            }
        }));
    };

    // Handle Writing Answer
    const handleWritingAnswer = (event) => {
        setAnswers((prev) => ({
            ...prev,
            writing: event.target.value
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
                                        name={`question-${currentIndex}`}
                                        value={option}
                                        className="peer h-8 w-8"
                                        onChange={() => handleSelectAnswer(option)}
                                        checked={answers[currentQuestion.category]?.[currentIndex] === option}
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
                        onClick={() => setShowPopup(true)}
                        className="bg-black text-white font-bold p-2 px-6 mr-3 rounded-md"
                    >
                        Submit Practice Test!
                    </button>
                )}
            </div>

            {/* ✅ Submission Confirmation Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold">Confirm Submission</h3>
                        <p className="mt-2">Are you sure you want to submit the test?</p>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowPopup(false)} className="mr-2">Cancel</button>
                            <button onClick={() => toast.success("Practice Test Submitted!")} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
}

export default PracticeTestPage;
