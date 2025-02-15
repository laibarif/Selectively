import { Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';
import Navbar from './Frontend/Navbar/Navbar'; 
import Home from './Frontend/Home/Home'; 
import './App.css';
import Login from './Frontend/Login/Login';
import Signup from './Frontend/Signup/Signup';
import AdminDashboard from './Frontend/AdminDashboard/AdminDashboard';
import SelectQuestionPage from './Frontend/SelectQuestion/SelectQuestionPage';
import FreeAssesment from './Frontend/FreeAssesment/FreeAssesment';
import TestAssesmentBooks from './Frontend/FreeAssesment/TestAssesmentBooks';
import QuestionPage from './Frontend/FreeAssesment/QuestionPage';
import GenerateQuestionPage from './Frontend/GenerateQuestion/GenerateQuestionPage';
import FreeAssessment from './Frontend/FreeAssessment/FreeAssessment';
import ProtectedRoute from './Frontend/Context/ProtectedRoute';
import ViewQuestionsPage from './Frontend/view/ViewQuestionsPage';
import LandingPage from './Frontend/LandingPage/LandingPage';
import ReadingGenerateQuestions from './Frontend/GenerateQuestion/ReadingGenerateQuestions';
import StudentDashboard from './Frontend/StudentDashbaord/StudentDashboard';
import AddQuestionBooks from './Frontend/AddQuestions/AddQuestionBooks';
import MathQuestionAdd from './Frontend/AddQuestions/MathQuestionAdd';
import ReadingQuestiionAdd from './Frontend/AddQuestions/ReadingQuestiionAdd';
import ThinkingSkillQuestionAdd from './Frontend/AddQuestions/ThinkingSkillQuestionAdd';
import WritingQuestionAdd from './Frontend/AddQuestions/WritingQuestionAdd';
import ImportQuestions from './Frontend/ImportQuestions/ImportQuestions';
function App() {
  const location = useLocation();

  // List of routes where Navbar should not be displayed
  const noNavbarRoutes = ["/questions-page/:category"];

  // Determine if the current route matches any in the list
  const isNavbarHidden = noNavbarRoutes.some((route) => 
    location.pathname.startsWith(route.split(":")[0]) // Match static parts of dynamic routes
  );

  return (
    <>
    
      {!isNavbarHidden && <Navbar />}
      <Routes>
        <Route index element={<LandingPage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/select_question/:subject" element={<SelectQuestionPage />} />
        <Route path="/freeassesment" element={<FreeAssesment />} />
        <Route path="/test-assesment-books" element={<TestAssesmentBooks />} />
        <Route path="/questions-page/:category" element={<QuestionPage />} />
        <Route path="/questions/:subject" element={<SelectQuestionPage />} />
        <Route path="/view-questions/:subject" element={<ViewQuestionsPage />} />
        <Route path="/questions/:subject/:id" element={<GenerateQuestionPage />} />
        <Route path="/readingQuestion/:subject/:questionId/:extractQuestionId" element={<ReadingGenerateQuestions/>}/>
        <Route path="/landing" element={<LandingPage/>}/>
        <Route path="/free-assessment" element={<ProtectedRoute><FreeAssessment /></ProtectedRoute>} />
        <Route path='/add-questionsBooks' element={<ProtectedRoute><AddQuestionBooks/></ProtectedRoute>}/>
        <Route path='/import-questions' element={<ProtectedRoute><ImportQuestions/></ProtectedRoute>}/>
        <Route path='/add-mathQuestions' element={<ProtectedRoute><MathQuestionAdd/></ProtectedRoute>}/>
        <Route path='/add-readingQuestions' element={<ProtectedRoute><ReadingQuestiionAdd/></ProtectedRoute>}/>
        <Route path='/add-thinkingskillQuestions' element={<ProtectedRoute><ThinkingSkillQuestionAdd/></ProtectedRoute>}/>
        <Route path='/add-writingQuestions' element={<ProtectedRoute><WritingQuestionAdd/></ProtectedRoute>}/>
        
      </Routes>
    </>
  );
}

export default App;
