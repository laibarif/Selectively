import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [firstname, setFirstName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.firstName) {
        setFirstName(user.firstName);
      } else {
        setFirstName(user.username.split(" ")[0]);
      }
    }
  }, []);

  const startTest = (testType, category) => {
    navigate(`/test/${testType}/${category}`);
  };

  return (
    <div className="learning-section">
      <h2>
        <span className="emoji">📘</span> Hi{" "}
        <span className="font-bold ml-2 text-orange-500">{firstname || "Student"}</span>, Happy Learning.
      </h2>
      
      {/* Subject Selection */}
      <div className="subject-cards">
        {["Maths", "ThinkingSkills", "Writing", "Reading"].map((subject) => (
          <div key={subject} className="subject-card">
            <h3>{subject}</h3>
            <button onClick={() => startTest("subject-test", subject.toLowerCase())}>
              Start {subject} Test
            </button>
          </div>
        ))}
      </div>

      {/* Test Type Selection */}
      <div className="test-buttons">
        {["practice-test", "weekly-test", "mega-test"].map((test) => (
          <button key={test} className="test-button" onClick={() => startTest(test, "maths")}>
            {test.replace("-", " ").toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
