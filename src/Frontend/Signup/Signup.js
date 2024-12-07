import React, { useState } from 'react';
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
    children: [
      {
        firstName: '',
        lastName: '',
        grade: '',
        school: '',
      },
    ],
    terms: false,  // Initial state for the checkbox
  });

  const [is2FASent, setIs2FASent] = useState(false);
  const [otp, setOtp] = useState('');

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;

    if (name === "terms") {
      // Handling checkbox specific state change for "terms"
      setFormData({
        ...formData,
        terms: checked,  // Update the state directly for the checkbox
      });
      return;
    }

    if (dataset.childIndex) {
      const index = parseInt(dataset.childIndex, 10);
      setFormData((prevData) => {
        const updatedChildren = [...prevData.children];
        updatedChildren[index] = {
          ...updatedChildren[index],
          [name]: type === 'checkbox' ? checked : value,
        };
        return { ...prevData, children: updatedChildren };
      });
    } else {
      setFormData({
        ...formData,
        parent: { ...formData.parent, [name]: type === 'checkbox' ? checked : value },
      });
    }
  };

  // Add a new child form
  const handleAddChild = () => {
    setFormData({
      ...formData,
      children: [
        ...formData.children,
        { firstName: '', lastName: '', grade: '', school: '' },
      ],
    });
  };

  // Remove a child form by index
  const handleRemoveChild = (index) => {
    const updatedChildren = formData.children.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      children: updatedChildren,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if terms and conditions are agreed
    if (!formData.terms) {
      alert('Please agree to the terms of service.');
      return;
    }
  
    // Check if OTP is required and entered
    if (is2FASent && !otp) {
      alert('Please enter the OTP sent to your email.');
      return;
    }
  
    // Validate required parent fields
    if (
      !formData.parent.firstName ||
      !formData.parent.lastName ||
      !formData.parent.phone ||
      !formData.parent.email ||
      !formData.parent.username ||
      !formData.parent.password
    ) {
      alert('Please fill in all the required parent fields.');
      return;
    }
  
    // Validate required children fields
    for (const child of formData.children) {
      if (!child.firstName || !child.lastName) {
        alert('Please fill in all the required child fields (First Name and Last Name).');
        return;
      }
    }
  
    console.log('Sending signup data:', {
      username: formData.parent.username,
      email: formData.parent.email,
      phone_number: formData.parent.phone,
      password: formData.parent.password,
      children: formData.children.map(child => ({
        first_name: child.firstName,
        last_name: child.lastName,
        grade: child.grade,
        school: child.school,
      })),
      otp: is2FASent ? otp : null,
    });
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/accounts/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.parent.username,
          email: formData.parent.email,
          phone_number: formData.parent.phone,
          password: formData.parent.password,
          first_name: formData.parent.firstName,
          last_name: formData.parent.lastName,
          children: formData.children.map(child => ({
            first_name: child.firstName,
            last_name: child.lastName,
            grade: child.grade,
            school: child.school,
          })),
          otp: is2FASent ? otp : null,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Signup successful!');
        setFormData({
          parent: { firstName: '', lastName: '', phone: '', email: '', username: '', password: '' },
          children: [{ firstName: '', lastName: '', grade: '', school: '' }],
          terms: false,
        });
        setOtp('');
      } else {
        // Check if the error response has specific field errors
        if (data.details) {
          let errorMessage = 'Please correct the following errors:';
          Object.entries(data.details).forEach(([field, errors]) => {
            errorMessage += `\n- ${field}: ${errors.join(', ')}`;
          });
          alert(errorMessage);
        } else {
          // General error message
          alert(data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while signing up. Please try again.');
    }
  };
  

  // Send the 2FA code
  const handleSend2FA = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/accounts/send-2fa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.parent.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('2FA code sent to your email.');
        setIs2FASent(true);
      } else {
        alert(data.error || 'Error sending 2FA code.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending 2FA code.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create Your Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Parent Details */}
          <div className="input-group">
            <input
              type="text"
              name="firstName"
              placeholder="Parent First Name"
              className="input-field"
              value={formData.parent.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Parent Last Name"
              className="input-field"
              value={formData.parent.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            type="text"
            name="phone"
            placeholder="Parent Phone Number"
            className="input-field"
            value={formData.parent.phone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Parent Email"
            className="input-field"
            value={formData.parent.email}
            onChange={handleChange}
          />

          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="input-field"
              value={formData.parent.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="input-field"
              value={formData.parent.password}
              onChange={handleChange}
            />
          </div>

          {/* Children Details */}
          {formData.children.map((child, index) => (
            <div key={index} className="child-section">
              <h3>Child {index + 1}</h3>
              <div className="input-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Child First Name"
                  className="input-field"
                  value={child.firstName}
                  onChange={handleChange}
                  data-child-index={index}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Child Last Name"
                  className="input-field"
                  value={child.lastName}
                  onChange={handleChange}
                  data-child-index={index}
                />
              </div>
              <input
                type="text"
                name="grade"
                placeholder="Child Grade"
                className="input-field"
                value={child.grade}
                onChange={handleChange}
                data-child-index={index}
              />
              <input
                type="text"
                name="school"
                placeholder="School (Optional)"
                className="input-field"
                value={child.school}
                onChange={handleChange}
                data-child-index={index}
              />
              <button
                type="button"
                className="remove-child-btn"
                onClick={() => handleRemoveChild(index)}
              >
                Remove Child {index + 1}
              </button>
            </div>
          ))}

          {/* Add Child Button */}
          {formData.children.length < 3 && (
            <button type="button" className="add-child-btn" onClick={handleAddChild}>
              + Add Another Child
            </button>
          )}

          {/* Terms and Conditions */}
          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label htmlFor="terms">
              I agree to the terms of service and have read the privacy policy
            </label>
          </div>

          {/* 2FA Code */}
          {is2FASent && (
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              className="input-field"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          )}

          <button type="button" className="send-2fa-btn" onClick={handleSend2FA}>
            Send 2FA Code
          </button>

          {/* Submit Button */}
          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
