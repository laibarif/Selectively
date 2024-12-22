import React, { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import English from "../../assets/english.jpg";
import Math from "../../assets/math.jpg";
import ThinkingSkill from "../../assets/thinkingskill.jpg";
import { MdArrowForward } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
function TestAssesmentBooks() {
 
const navigate = useNavigate()

  const SubmitResult = async () => {
    try {
      const email = localStorage.getItem('userEmail');
  
      if (!email) {
        toast.error('No email found in localStorage.');
        return;
      }
  
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/send-user-details`,
        { email }
      );
  
      toast.info(response.data.message);
  
      localStorage.removeItem('userEmail');
      navigate('/freeassesment')
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'An error occurred. Please try again.'
      );
    }
  };
  const handleCheckReadingQuestions = async (path) => {
    try {
      const email = localStorage.getItem("userEmail");

      if (!email) {
        toast.error("No email found in localStorage.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/checkReadingTestAlreadyConduct`,
        { email }
      );
      if (response.data.navigate) {
        navigate(path);
      } else {
        toast.warning(response.data.message || "This test is already completed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const handleCheckMathsQuestions = async (path) => {
    try {
      const email = localStorage.getItem("userEmail");

      if (!email) {
        toast.error("No email found in localStorage.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/checkMathTestAlreadyConduct`,
        { email }
      );

      if (response.data.navigate) {
        navigate(path);
      } else {
        toast.warning(response.data.message || "This test is already completed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const handleCheckThinkingSkillQuestions = async (path) => {
    try {
      const email = localStorage.getItem("userEmail");

      if (!email) {
        toast.error("No email found in localStorage.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/freeassesment/checkThinkingSkillsTestAlreadyConduct`,
        { email }
      );

      if (response.data.navigate) {
        navigate(path);
      } else {
        toast.warning(response.data.message || "This test is already completed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };
  
  return (
    <div>
      <div class="max-w-2xl mx-auto mt-4 space-y-4">
        <div class="flex gap-3 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start hover:bg-gray-100">
          <div class="relative w-40 h-40 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={English}
              alt="English"
            />
          </div>
          <div class="w-full flex flex-col gap-2 py-2">
            <p class="text-xl font-bold">English</p>
            <p class="text-gray-500">Test your English skills with MCQs.</p>
            <p class="text-sm text-gray-500">
              <strong>Questions:</strong> 10
              <br />
              <strong>Time:</strong> 13 minutes
            </p>
            <span class="w-full flex items-center justify-end text-gray-500 pr-2">
              <MdArrowForward
              onClick={() => handleCheckReadingQuestions('/questions-page/randomReadingQuestions')}
              className="w-8 h-8 text-lg text-black hover:bg-black hover:text-white rounded-full" />
             
            </span>
          </div>
        </div>

        <div class="flex gap-3 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start hover:bg-gray-100">
          <div class="relative w-40 h-40 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={Math}
              alt="Math"
            />
          </div>
          <div class="w-full flex flex-col gap-2 py-2">
            <p class="text-xl font-bold">Math</p>
            <p class="text-gray-500">
              Sharpen your Math skills with challenging MCQs.
            </p>
            <p class="text-sm text-gray-500">
              <strong>Questions:</strong> 15
              <br />
              <strong>Time:</strong> 20 minutes
            </p>
            <span class="w-full flex items-center justify-end text-gray-500 pr-2">
            
              <MdArrowForward
              onClick={() => handleCheckMathsQuestions('/questions-page/randomMathsQuestions')}
              className="w-8 h-8 text-lg text-black hover:bg-black hover:text-white rounded-full" />
              
            </span>
          </div>
        </div>

        <div class="flex gap-3 bg-white border border-gray-300 rounded-xl overflow-hidden items-center justify-start hover:bg-gray-100">
          <div class="relative w-40 h-40 flex-shrink-0">
            <img
              class="absolute left-0 top-0 w-full h-full object-cover object-center transition duration-50"
              loading="lazy"
              src={ThinkingSkill}
              alt="Thinking Skills"
            />
          </div>
          <div class="w-full flex flex-col gap-2 py-2">
            <p class="text-xl font-bold">Thinking Skills</p>
            <p class="text-gray-500">
              Test your logical and analytical thinking abilities.
            </p>
            <p class="text-sm text-gray-500">
              <strong>Questions:</strong> 12
              <br />
              <strong>Time:</strong> 15 minutes
            </p>
            <span class="w-full flex items-center justify-end text-gray-500 pr-2">
             
              <MdArrowForward 
             onClick={() => handleCheckThinkingSkillQuestions('/questions-page/randomThinkingskillQuestions')} 
              className="w-8 h-8 text-lg text-black hover:bg-black hover:text-white rounded-full" />
              
            </span>
          </div>
        </div>
      </div>

      <div class="max-w-2xl  mx-auto mt-4">
        <button 
        onClick={SubmitResult}
        class="w-auto flex mx-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
          Submit Result
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TestAssesmentBooks;
