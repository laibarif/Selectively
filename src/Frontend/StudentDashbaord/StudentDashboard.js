// LearningSection.js
import React, { useEffect, useState } from "react";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [firstname, setFirstName] = useState("");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      console.log(JSON.parse(localStorage.getItem("user")));

      // Check if first_name exists in the user object
      if (user.firstName) {
        setFirstName(user.firstName);
      } else {
        // Fallback: Extract first word from full username
        const nameParts = user.username.split(" ");
        setFirstName(nameParts[0]);
      }
    }
  }, []);
  return (
    <div className="learning-section">
      <h2>
        <span className="emoji">📘</span> Hi <span className="font-bold ml-2 text-orange-500"> {firstname || "Student"}</span>, Happy Learning.
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
