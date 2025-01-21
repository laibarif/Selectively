// LearningSection.js
import React from "react";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  return (
    <div className="learning-section">
      <h2>
        <span className="emoji">📘</span> Hi laiba, happy learning.
      </h2>
      <div className="subject-cards">
        <div className="subject-card">
          <h3>Maths</h3>
          <button>Start Maths Test</button>
        </div>
        <div className="subject-card active">
          <h3>Thinking Skills</h3>
          <button>Start Thinking...</button>
        </div>
        <div className="subject-card">
          <h3>Writing</h3>
          <button>Start Writing...</button>
        </div>
        <div className="subject-card">
          <h3>Reading</h3>
          <button>Start Reading...</button>
        </div>
      </div>
      <div className="test-buttons">
        <button className="test-button">Practice Test</button>
        <button className="test-button">Mega Test</button>
      </div>
    </div>
  );
};

export default StudentDashboard;
