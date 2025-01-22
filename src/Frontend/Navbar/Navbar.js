import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/Logo_Transparent - Complete.svg";
import './Navbar.css';

function Navbar() {
    const [isDropdownOpen, setDropdownOpen] = useState(false);  // State for "Other Services" dropdown (desktop)
    const [userRole, setUserRole] = useState(null); // State to store user role

    useEffect(() => {
        window.scrollTo(0, 0);

        // Get the user object from localStorage
        const user = localStorage.getItem('user');
        
        // If the user object exists, parse it and set the role
        if (user) {
            const parsedUser = JSON.parse(user); // Parse the user object from the string
            setUserRole(parsedUser.role); // Set the role
        }
    }, []); 

    const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

    const handleLogout = () => {
        // Clear user data from localStorage and redirect to login page
        localStorage.removeItem('userRole');
        // Redirect to login (or home page)
        window.location.href = '/login'; // Or use history.push('/login') if using react-router-dom v5+
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Logo" className="responsive-logo" />
                </Link>
            </div>

            {/* Desktop Navigation */}
            
            <ul className="navbar-nav">
            {userRole === 'user' && (
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

                {/* If the user is an admin */}
                {userRole === 'admin' && (
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
                )}
            </ul>
        </nav>
    );
}

export default Navbar;



            {/* Hamburger icon to open the main drawer for mobile */}
            {/* <Button variant="outline" className="menu-icon" onClick={onOpen}>
                <HamburgerIcon w={6} h={6} />
            </Button> */}

            {/* Chakra UI Drawer for Main Menu (Mobile) */}
            {/* <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Main Menu</DrawerHeader>
                    <DrawerBody>
                        <ul className="drawer-nav">
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/" onClick={() => handleLinkClick("/")}>Home</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/market-my-property" onClick={() => handleLinkClick("/market-my-property")}>Market My Property</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/why-sell-with-us" onClick={() => handleLinkClick("/why-sell-with-us")}>Why Sell With Us</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/social-media-reach" onClick={() => handleLinkClick("/social-media-reach")}>Our Social Media Reach</Link>
                            </li>
                            <li className="drawer-item" onClick={onServicesOpen}>
                                <Link className="drawer-link" to="#">Services</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/chatwithus" onClick={() => handleLinkClick("/chatwithus")}>Connect With Us</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/about-us" onClick={() => handleLinkClick("/about-us")}>About Us</Link>
                            </li>
                            
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/login" onClick={() => handleLinkClick("/login")}>LOGIN</Link>
                            </li>
                        </ul>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            
            <Drawer placement="right" onClose={onServicesClose} isOpen={isServicesOpen}>
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Services</DrawerHeader>
                    <DrawerBody>
                        <ul className="services-drawer-nav">
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/service/mortgage-broker" onClick={() => { onServicesClose(); onClose(); }}>CONNECT YOU TO MORTGAGE BROKER</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/service/accountant" onClick={() => { onServicesClose(); onClose(); }}>CONNECT YOU TO ACCOUNTANT</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/service/solicitor" onClick={() => { onServicesClose(); onClose(); }}>CONNECT YOU TO SOLICITOR</Link>
                            </li>
                            <li className="drawer-item">
                                <Link className="drawer-link" to="/" onClick={onServicesClose}>BACK TO MAIN MENU</Link>
                            </li>
                        </ul>
                    </DrawerBody>
                </DrawerContent>
            </Drawer> */}