import { Route, Routes,useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import Navbar from './Frontend/Navbar/Navbar'; 
import Home from './Frontend/Home/Home'; 
import './App.css';
import Login from './Frontend/Login/Login';
import Signup from './Frontend/Signup/Signup';

function App() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <Routes>
        <Route index element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
      </Routes>
    </>
  );
}

export default App