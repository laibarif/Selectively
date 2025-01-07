import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import English from "../../assets/english.jpg";
import Math from "../../assets/math.jpg";
import ThinkingSkill from "../../assets/thinkingskill.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function TestAssesmentBooks() {
  const [assessmentDetails, setAssessmentDetails] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  const handleConfirm = () => {
    setShowPopup(false);
    SubmitResult();
  };
  const navigate = useNavigate();
  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) {
          toast.error("No email found in localStorage.");
          return;
        }
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/userAssessmentDetails?email=${email}`
        );
        setAssessmentDetails(response.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch assessment details."
        );
      }
    };

    fetchAssessmentDetails();
  }, []);

  const SubmitResult = async () => {
    setIsLoading(true);
    try {
      const email = localStorage.getItem("userEmail");

      if (!email) {
        toast.error("No email found in localStorage.");
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/send-user-details`,
        { email }
      );

      toast.info(response.data.message);

      localStorage.removeItem("userEmail");
      navigate("/freeassesment");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckQuestions = async (path, type) => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        toast.error("No email found in localStorage.");
        return;
      }

      const endpoints = {
        reading: "/api/freeassesment/checkReadingTestAlreadyConduct",
        math: "/api/freeassesment/checkMathTestAlreadyConduct",
        thinking: "/api/freeassesment/checkThinkingSkillsTestAlreadyConduct"
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}${endpoints[type]}`,
        { email }
      );

      if (response.data.navigate) {
        navigate(path);
      } else {
        toast.warning(
          response.data.message || "This test is already completed."
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const reading_test = assessmentDetails.user?.reading_score;
  const math_test = assessmentDetails.user?.maths_score;
  const thinking_skill = assessmentDetails.user?.thinking_skills_score;

  // Determine button states
  const isReadingEnabled = reading_test === null;
  const isMathEnabled = reading_test !== null && math_test === null;
  const isThinkingEnabled = math_test !== null && thinking_skill === null;

  return (
    <div>
      <div class="max-w-7xl mx-auto mt-2 space-y-8">
        <div class="flex gap-5 mt-8 bg-white border border-gray-300 rounded-xl overflow-hidden items-stretch hover:bg-gray-100 relative transition-all transform hover:-translate-y-3 hover:translate-z-4 hover:shadow-md hover:shadow-gray-500">
          <div class="relative w-1/3 h-56 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={English}
              alt="English"
            />
          </div>

          <div class="w-full h-full flex flex-col justify-between py-4">
            <p class="text-xl md:text-2xl font-bold">English</p>

            <p class="text-base md:text-lg text-gray-800 font-semibold">
              Test your English skills with MCQs.
            </p>
            <p class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl">Questions:</strong>{" "}
              10
            </p>
            <span class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl">Time:</strong> 13
              minutes
            </span>

            <div class="text-gray-800 font-medium text-xs sm:text-sm mt-1">
              {assessmentDetails.user?.reading_score === null ? (
                <strong class="text-gray-800 text-lg">Unattempted</strong>
              ) : (
                <>
                  <span class="mr-2 text-yellow-500 text-xl">
                    <strong>Unattempted:</strong>{" "}
                    {assessmentDetails.readingStats?.totalUnattempted}
                  </span>
                  <span class="mr-2 text-blue-500 text-xl">
                    <strong>Attempted:</strong>{" "}
                    {assessmentDetails.readingStats?.totalAttempted}
                  </span>
                  <span class="mr-2 text-green-500 text-xl">
                    <strong>Correct:</strong>{" "}
                    {assessmentDetails.user?.reading_score}
                  </span>
                  <span class="text-red-500 text-xl">
                    <strong>Wrong:</strong>{" "}
                    {10 - assessmentDetails.user?.reading_score}
                  </span>
                </>
              )}
            </div>

            <div class="flex items-center justify-end">
              <button
                onClick={() =>
                  handleCheckQuestions(
                    "/questions-page/randomReadingQuestions",
                    "reading"
                  )
                }
                disabled={!isReadingEnabled}
                className={`w-32 h-10 px-4 mr-3 mb-2 text-white font-bold rounded-lg ${
                  isReadingEnabled
                    ? "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"
                    : "bg-gray-400 cursor-not-allowed"
                } focus:outline-none transition-transform ${
                  isReadingEnabled ? "hover:translate-x-[5px]" : ""
                }`}
              >
                {reading_test !== null ? "Completed" : "Start Test"}
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-5 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start hover:bg-gray-100 relative transition-all transform hover:-translate-y-3 hover:translate-z-4 hover:shadow-md hover:shadow-gray-500">
          <div class="relative w-1/3 h-56 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={Math}
              alt="Math"
            />
          </div>

          <div class="w-full flex flex-col gap-1 py-2">
            <p class="text-xl md:text-2xl font-bold">Math</p>
            <p class="w-36 md:w-full text-base text-gray-800 font-semibold md:text-lg ">
              Sharpen your Math skills with challenging MCQs.
            </p>
            <p class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl pb-2">
                Questions:
              </strong>{" "}
              10
            </p>
            <span class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl">Time:</strong> 13
              minutes
            </span>
            <div class="text-gray-800 font-medium text-xs sm:text-sm mt-1">
              {assessmentDetails.user?.maths_score === null ? (
                <strong class="text-gray-800 text-lg">Unattempted</strong>
              ) : (
                <>
                  <span class="mr-2 text-yellow-500 text-xl">
                    <strong>Unattempted:</strong>{" "}
                    {assessmentDetails.mathsStats?.totalUnattempted}
                  </span>
                  <span class="mr-2 text-blue-500 text-xl">
                    <strong>Attempted:</strong>{" "}
                    {assessmentDetails.mathsStats?.totalAttempted}
                  </span>
                  <span class="mr-2 text-green-500 text-xl">
                    <strong>Correct:</strong>{" "}
                    {assessmentDetails.user?.maths_score}
                  </span>
                  <span class="text-red-500 text-xl">
                    <strong>Wrong:</strong>{" "}
                    {10 - assessmentDetails.user?.maths_score}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() =>
                  handleCheckQuestions(
                    "/questions-page/randomMathsQuestions",
                    "math"
                  )
                }
                disabled={!isMathEnabled}
                className={`w-32 h-10 px-4 mr-3 mb-2 text-white font-bold rounded-lg ${
                  isMathEnabled
                    ? "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"
                    : "bg-gray-400 cursor-not-allowed"
                } focus:outline-none transition-transform ${
                  isMathEnabled ? "hover:translate-x-[5px]" : ""
                }`}
              >
                {math_test !== null ? "Completed" : "Start Test"}
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-5 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start hover:bg-gray-100 relative transition-all transform hover:-translate-y-3 hover:translate-z-4 hover:shadow-md hover:shadow-gray-500">
          <div class="relative w-1/3 h-56 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={ThinkingSkill}
              alt="ThinkingSkill"
            />
          </div>

          <div class="w-full flex flex-col gap-1 py-2">
            <p class="text-xl md:text-2xl font-bold">Thinking Skills</p>
            <p class="w-36 md:w-full text-base text-gray-800 font-semibold md:text-lg ">
              Test your logical and analytical thinking abilities.
            </p>
            <p class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl pb-2">
                Questions:
              </strong>{" "}
              10
            </p>
            <span class="text-gray-800 font-semibold text-lg">
              <strong class="text-black font-bold text-xl">Time:</strong> 13
              minutes
            </span>

            <div class="text-gray-800 font-medium text-xs sm:text-sm mt-1">
              {assessmentDetails.user?.thinking_skills_score === null ? (
                <strong class="text-gray-800 text-lg">Unattempted</strong>
              ) : (
                <>
                  <span class="mr-2 text-yellow-500 text-xl">
                    <strong>Unattempted:</strong>{" "}
                    {assessmentDetails.thinkingSkillsStats?.totalUnattempted}
                  </span>
                  <span class="mr-2 text-blue-500 text-xl">
                    <strong>Attempted:</strong>{" "}
                    {assessmentDetails.thinkingSkillsStats?.totalAttempted}
                  </span>
                  <span class="mr-2 text-green-500 text-xl">
                    <strong>Correct:</strong>{" "}
                    {assessmentDetails.user?.thinking_skills_score}
                  </span>
                  <span class="text-red-500 text-xl">
                    <strong>Wrong:</strong>{" "}
                    {10 - assessmentDetails.user?.thinking_skills_score}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() =>
                  handleCheckQuestions(
                    "/questions-page/randomThinkingskillQuestions",
                    "thinking"
                  )
                }
                disabled={!isThinkingEnabled}
                className={`w-32 h-10 px-4 mr-3 mb-2 text-white font-bold rounded-lg ${
                  isThinkingEnabled
                    ? "bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500"
                    : "bg-gray-400 cursor-not-allowed"
                } focus:outline-none transition-transform ${
                  isThinkingEnabled ? "hover:translate-x-[5px]" : ""
                }`}
              >
                {thinking_skill !== null ? "Completed" : "Start Test"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* Button to trigger the popup */}
        <div className="max-w-2xl mx-auto my-4">
          <button
            onClick={handleButtonClick}
            className="w-auto flex mx-auto text-white font-bold py-2 px-10 rounded-md bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 focus:outline-none shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
          >
            Submit Result
          </button>
        </div>

        {/* Popup Modal */}
        {showPopup && (
          <div
            id="YOUR_ID"
            className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div
              className="bg-white rounded-lg shadow-lg transition-transform transform scale-100 max-w-md w-full mx-4 sm:mx-0"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="relative">
                <button
                  onClick={handleCancel}
                  type="button"
                  aria-label="Close"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex flex-col items-center p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3
                    className="text-lg font-semibold text-gray-900 mt-4"
                    id="modal-headline"
                  >
                    Confirm Submission
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Are you sure you want to submit your results? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-end px-6 pb-4 space-x-3">
                  <button
                    onClick={handleCancel}
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    No
                  </button>
                  <button
                    onClick={handleConfirm}
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Yes, Confirm
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
              Sending Result on email address...
            </span>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default TestAssesmentBooks;
