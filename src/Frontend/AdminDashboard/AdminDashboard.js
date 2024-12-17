import React from "react";
import { Link } from "react-router-dom"; // Assuming you are using React Router for navigation
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {/* Generate Questions Section */}
      <div className="section">
        <div className="card generate-questions-card">
          <div className="card-header generate-questions-header">
            <h5>Generate Questions</h5>
          </div>
          <div className="card-body">
            <p className="card-text">Click on a subject to generate new questions:</p>
            <div className="button-group">
              <Link to="/select_question/Maths" className="btn custom-btn primary-btn">
                Maths
              </Link>
              <Link to="/select_question/ThinkingSkills" className="btn custom-btn primary-btn">
                Thinking Skills
              </Link>
              <Link to="/select_question/Writing" className="btn custom-btn primary-btn">
                Writing
              </Link>
              <Link to="/select_question/Reading" className="btn custom-btn primary-btn">
                Reading
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* View Questions Section */}
      <div className="section">
        <div className="card view-questions-card">
          <div className="card-header view-questions-header">
            <h5>View Questions</h5>
          </div>
          <div className="card-body">
            <p className="card-text">Click on a subject to view all questions:</p>
            <div className="button-group">
              <Link to="/view_questions/Maths" className="btn custom-btn success-btn">
                Maths
              </Link>
              <Link to="/view_questions/ThinkingSkills" className="btn custom-btn success-btn">
                Thinking Skills
              </Link>
              <Link to="/view_questions/Writing" className="btn custom-btn success-btn">
                Writing
              </Link>
              <Link to="/view_questions/Reading" className="btn custom-btn success-btn">
                Reading
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
