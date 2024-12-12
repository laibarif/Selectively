import React, { useState, useEffect } from 'react';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    parent: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
    },
    children: [],
    currentChild: {
      firstName: '',
      lastName: '',
      grade: '',
      school: '',
    },
    terms: false,
  });

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [is2FASent, setIs2FASent] = useState(false);
  const [otp, setOtp] = useState('');
  const [childCount, setChildCount] = useState(1);
  const [usernameForOTP, setUsernameForOTP] = useState('');

  // Function to debounce username check
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedUsername = useDebounce(formData.parent.username, 500);

  // Function to check username availability
  const checkUsername = async (username) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    checkUsername(debouncedUsername);
  }, [debouncedUsername]);

  // Handle input changes for parent and current child
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle checkbox input (for terms and conditions)
      if (name === 'terms') {
        setFormData((prevData) => ({
          ...prevData,
          terms: checked,  // Update terms with the checked status
        }));
      }
    } else {
      // Handle text and other fields
      if (name.startsWith('parent_')) {
        const parentField = name.replace('parent_', '');
        setFormData((prevData) => ({
          ...prevData,
          parent: { ...prevData.parent, [parentField]: value },
        }));
      }
      else if (name.startsWith('child_')) {
        const childField = name.replace('child_', '');
        setFormData((prevData) => ({
          ...prevData,
          currentChild: { ...prevData.currentChild, [childField]: value },
        }));
      }
    }
  };


  // Add current child to children array
  // Add current child to children array
const handleAddChild = () => {
  const { firstName, lastName, grade, school } = formData.currentChild;

  if (!firstName || !lastName || !grade) {
    alert('Please fill in all required child fields (First Name, Last Name, Grade).');
    return;
  }

  // Log before state update
  console.log('Before adding child:', formData.children);

  const updatedChildren = [...formData.children, { firstName, lastName, grade, school }];
  
  // Log after preparing the new children array
  console.log('After adding child:', updatedChildren);

  setFormData((prevData) => ({
    ...prevData,
    children: updatedChildren,  // Update the children state
    currentChild: { firstName: '', lastName: '', grade: '', school: '' },  // Reset the form for the next child
  }));

  setChildCount(childCount + 1);
};

  // Remove a child by index
  const handleRemoveChild = (index) => {
    const updatedChildren = formData.children.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      children: updatedChildren,
    });
    setChildCount(childCount - 1);
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form Data before submit :', formData);

    // Ensure all children are added before submission
    if (childCount > formData.children.length + 1) {
      alert('Please add all children details before submitting the form.');
      return;
    }

    // Validate terms acceptance
    if (!formData.terms) {
      alert('Please agree to the terms of service.');
      return;
    }

    // Validate parent fields
    const { firstName, lastName, phone, email, username, password } = formData.parent;
    if (!firstName || !lastName || !phone || !email || !username || !password) {
      alert('Please fill in all required parent fields.');
      return;
    }

    // Check if username is available
    if (usernameAvailable === false) {
      alert('Username is already taken. Please choose another one.');
      return;
    }

    // Prepare data for backend
    const payload = {
      parent: formData.parent,
      children: formData.children,  // This should now correctly contain the children data
      terms: formData.terms,
      // otp will be sent in a separate verification step
    };

    console.log('Sending Payload:', payload);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful! Please check your email for the 2FA OTP code.');
        // Capture the username for OTP verification
        setUsernameForOTP(formData.parent.username);
        // Reset form
        setFormData({
          parent: { firstName: '', lastName: '', phone: '', email: '', username: '', password: '' },
          children: [],
          currentChild: { firstName: '', lastName: '', grade: '', school: '' },
          terms: false,
        });
        setOtp('');
        setIs2FASent(false);
        setChildCount(1);
        setUsernameAvailable(null);
      } else {
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while signing up. Please try again.');
    }
  };


  // Send the 2FA code (Resend OTP)
  const handleSend2FA = async () => {
    // Validate parent email before sending 2FA
    const { email } = formData.parent;
    if (!email) {
      alert('Please enter your email before requesting 2FA code.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('2FA OTP sent to your email.');
        setIs2FASent(true);
      } else {
        alert(data.message || 'Error sending 2FA OTP.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending 2FA OTP.');
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!usernameForOTP || !otp) {
      alert('Username and OTP are required.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameForOTP, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('OTP verified successfully! Your account is now active.');
        // Optionally, redirect to login or dashboard
        setUsernameForOTP('');
        setOtp('');
      } else {
        alert(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('An error occurred while verifying OTP. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Parent Details */}
          <h3>Parent Details</h3>
          <div className="input-group">
            <input
              type="text"
              name="parent_firstName"
              placeholder="Parent First Name"
              className="input-field"
              value={formData.parent.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="parent_lastName"
              placeholder="Parent Last Name"
              className="input-field"
              value={formData.parent.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="text"
            name="parent_phone"
            placeholder="Phone Number"
            className="input-field"
            value={formData.parent.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="parent_email"
            placeholder="Email Address"
            className="input-field"
            value={formData.parent.email}
            onChange={handleChange}
            required
          />

          <div className="input-group">
            <div className="username-wrapper">
              <input
                type="text"
                name="parent_username"
                placeholder="Username"
                className="input-field"
                value={formData.parent.username}
                onChange={handleChange}
                required
              />
              {checkingUsername && <span className="username-status">Checking...</span>}
              {usernameAvailable === true && <span className="username-status available">✓ Available</span>}
              {usernameAvailable === false && <span className="username-status taken">✗ Taken</span>}
            </div>
            <input
              type="password"
              name="parent_password"
              placeholder="Password"
              className="input-field"
              value={formData.parent.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Current Child Details */}
          <h3>Child {childCount}</h3>
          <div className="input-group">
            <input
              type="text"
              name="child_firstName"
              placeholder="Child First Name"
              className="input-field"
              value={formData.currentChild.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="child_lastName"
              placeholder="Child Last Name"
              className="input-field"
              value={formData.currentChild.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <input
            type="text"
            name="child_grade"
            placeholder="Grade (Year)"
            className="input-field"
            value={formData.currentChild.grade}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="child_school"
            placeholder="School (Optional)"
            className="input-field"
            value={formData.currentChild.school}
            onChange={handleChange}
          />

          <button type="button" className="add-child-btn" onClick={handleAddChild}>
            + Add Another Child
          </button>

          {/* Display Added Children */}
          {formData.children.length > 0 && (
            <div className="added-children">
              <h3>Added Children</h3>
              {formData.children.map((child, index) => (
                <div key={index} className="child-section">
                  <p>
                    <strong>
                      {index + 1}. {child.firstName} {child.lastName}
                    </strong>{' '}- Grade: {child.grade}, School: {child.school || 'N/A'}
                    <button
                      type="button"
                      className="remove-child-btn"
                      onClick={() => handleRemoveChild(index)}
                    >
                      Remove
                    </button>
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}  // Use formData.terms to control the checkbox
              onChange={handleChange}   // Handle change using handleChange
              required
            />
            <label htmlFor="terms">
              I agree to the <a href="/terms">terms of service</a> and have read the{' '}
              <a href="/privacy">privacy policy</a>.
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="signup-btn" disabled={checkingUsername}>
            Sign Up
          </button>
        </form>

        {/* OTP Verification Section */}
        {usernameForOTP && (
          <div className="otp-verification">
            <h3>Verify Your Email</h3>
            <p>An OTP has been sent to your email. Please enter it below to verify your account.</p>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="button" className="verify-otp-btn" onClick={handleVerifyOTP}>
              Verify OTP
            </button>
            <button type="button" className="resend-otp-btn" onClick={handleSend2FA}>
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
