import { Route, Routes,useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
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

function App() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <Routes>
        <Route index element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/select_question/:subject" element={<SelectQuestionPage/>} />
        <Route path='/freeassesment' element={<FreeAssesment/>}/>
        <Route path='/test-assesment-books' element={<TestAssesmentBooks/>}/>
        <Route path="/questions-page/:category" element={<QuestionPage />} />
      </Routes>
    </>
  );
}

export default App