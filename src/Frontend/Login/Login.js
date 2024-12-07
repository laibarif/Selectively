import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';  // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

const Login = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',  // Single field for both username or email
        password: '',
    });

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
  
      const loginField = formData.usernameOrEmail;  // Either username or email
  
      // Log the request payload
      console.log('Request Payload:', {
          email_or_username: loginField,
          password: formData.password
      });
  
      try {
          const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/accounts/login/`, {
              email_or_username: loginField,
              password: formData.password,
          });
  
          // Handle successful login response
          const { access, refresh, user } = response.data;
  
          // Store the tokens
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          localStorage.setItem('user', JSON.stringify(user));
  
          setSuccessMessage('Login Successful! Welcome, ' + user.username);
          navigate('/dashboard');
      } catch (err) {
          setError('Invalid credentials. Please try again.');
          console.error('Login Error:', err.response?.data || err.message);
      } finally {
          setLoading(false);
      }
  };
  

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Log in to your account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="usernameOrEmail"
                            placeholder="Username or Email"
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
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                {error && <p className="error-message">{error}</p>} {/* Show error message */}
                {successMessage && <p className="success-message">{successMessage}</p>} {/* Show success message */}

                <p className="forgot-password">
                    <a href="/forgot-password">Forgot your password?</a>
                </p>
                <p className="signup-link">
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
