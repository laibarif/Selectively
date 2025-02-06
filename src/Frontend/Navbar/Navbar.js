import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../assets/Logo_Transparent - Complete.svg";
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role);
    } else {
      setUserRole(null); // Set userRole to null if no user is logged in
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('refresh_token');
    localStorage.setItem('isAuthenticated', false);
    setUserRole(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="Logo" className="responsive-logo" />
        </Link>
      </div>

      <ul className="navbar-nav">
        {userRole === 'admin' ? (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/admin-dashboard">Admin Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-questionsBooks">Add Questions</Link>
            </li>
            <li className="nav-item">
              <button className="font-semibold bg-red-600 px-6 py-3 rounded-md text-center text-white hover:bg-red-500" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : userRole === 'student' ? (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/student-dashboard">Student Dashboard</Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/profile">My Profile</Link>
            </li> */}
            <li className="nav-item">
              <button className="font-semibold bg-red-600 px-6 py-3 rounded-md text-center text-white hover:bg-red-500" onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/landing">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="">Pricing</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="freeassesment">Free Assessment</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="">Useful resources</Link>
            </li>
            <li className="nav-item login-item">
              <Link className="font-semibold bg-yellow-600 px-6 py-3 rounded-md text-center text-white hover:bg-yellow-500" to="/login">Log In/Sign up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;