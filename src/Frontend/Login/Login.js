import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';  // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',  // Single field for both username or email
    password: '',
  });

console.log(process.env.REACT_APP_BACKEND_URL)
  const [error, setError] = useState(null);  // To hold error messages
  const [loading, setLoading] = useState(false);  // To manage loading state
  const [successMessage, setSuccessMessage] = useState('');  // To show success message
  const navigate = useNavigate(); // Initialize the navigate function

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        email_or_username: formData.usernameOrEmail,
        password: formData.password,
      });

      const { access, refresh, user } = response.data;

      // Store the tokens and user data in localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccessMessage('Login Successful! Welcome, ' + user.username);

      // Navigate to the appropriate dashboard based on the role
      if (user.role === 'admin') {
       
        navigate('/admin-dashboard');  // Admin dashboard
      } else {
        navigate('/student-dashboard');  // Student dashboard
      }
      window.location.reload();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Invalid credentials. Please try again.');
      } else {
        setError('An error occurred while logging in. Please try again later.');
      }
      console.error('Login Error:');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen login-container ">
      <div className="login-form">
        <h2 className='login-form-heading'>Log in to your account</h2>
        <form onSubmit={handleSubmit}>
          {/* Login Details */}
          <div className="input-group">
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Enter your username"
              className="input-field"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="bg-orange-600 text-white text-md font-bold p-3 border-none rounded-md w-full mt-1 hover:bg-orange-500" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Show error message */}
        {error && <p className="error-message">{error}</p>}

        {/* Show success message */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        {/* <p className="forgot-password">
          <a href="/forgot-password">Forgot your password?</a>
        </p> */}
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
