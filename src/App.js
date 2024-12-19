import { Route, Routes,useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Navbar from './Frontend/Navbar/Navbar'; 
import Home from './Frontend/Home/Home'; 
import './App.css';
import Login from './Frontend/Login/Login';
import Signup from './Frontend/Signup/Signup';
import AdminDashboard from './Frontend/AdminDashboard/AdminDashboard';
import SelectQuestionPage from './Frontend/SelectQuestion/SelectQuestionPage';
import GenerateQuestionPage from './Frontend/GenerateQuestion/GenerateQuestionPage';
import FreeAssessment from './Frontend/FreeAssessment/FreeAssessment';
import ProtectedRoute from './Frontend/Context/ProtectedRoute';

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
        <Route path="/questions/:subject" element={<SelectQuestionPage/>} />
        <Route path="/questions/:subject/:id" element={<GenerateQuestionPage />} />
        <Route path="/free-assessment" element={ <ProtectedRoute> <FreeAssessment /> </ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App