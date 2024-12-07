import React from 'react';
import './ForgetPassword.css';
import logo from '../../assets/bpblogo.png'; // Adjust the path to your logo file

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <img src={logo} alt="AIVILLE Logo" className="forgetpassword-logo" />
        <h2>Forgot your password?</h2>
        <p>Enter your email to reset your password</p>
        <input type="email" placeholder="Email" className="email-input" />
        <button className="reset-password-btn">Reset my password</button>
        <p className="signup-link">
          Don’t have an account? <a href="/signup">Sign up</a>
        </p>
        <p className="signin-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
