// src/components/FreeAssessment.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';

const FreeAssessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAssessmentClick = () => {
    if (user) {
      navigate('/start-test'); // Path to the test page
    } else {
      navigate('/login'); // Path to the login page
    }
  };

  return (
    <button onClick={handleAssessmentClick}>
      Free Assessment
    </button>
  );
};

export default FreeAssessment;
