import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { Drawer, DrawerBody, DrawerHeader, DrawerContent, DrawerCloseButton, Button, useDisclosure } from '@chakra-ui/react';
// import { Drawer, DrawerBody, DrawerHeader, DrawerCloseButton,DrawerContent, Button, useDisclosure  } from '@chakra-ui/react';
// import { HamburgerIcon } from '@chakra-ui/icons';
import logo from "../../assets/Logo_Transparent - Complete.svg";
import './Navbar.css';

function Navbar() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    // const { isOpen, onOpen, onClose } = useDisclosure(); // For main drawer (mobile)
    // const { isOpen: isServicesOpen, onOpen: onServicesOpen, onClose: onServicesClose } = useDisclosure(); // For "Other Services" drawer (mobile)
    const [isDropdownOpen, setDropdownOpen] = useState(false);  // State for "Other Services" dropdown (desktop)

    const toggleDropdown = () => setDropdownOpen(!isDropdownOpen);

    // const handleLinkClick = (link) => {
    //     onClose(); // Close the main drawer
    // };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Logo" className="responsive-logo" />
                </Link>
                {/* <h2 className="title">Selectively</h2> */}
            </div>

            {/* Desktop Navigation */}
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="">Pricing</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/free-assessment">Free Assessment</Link>
                </li>
                {/* Other Services dropdown for desktop */}
                {/* <li className="nav-item dropdown" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
                    <Link className="nav-link dropdown-toggle" to="/service/mortgage-broker">Services</Link>
                    {isDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/service/mortgage-broker">CONNECT YOU TO MORTGAGE BROKER</Link></li>
                            <li><Link className="dropdown-item" to="/service/accountant">CONNECT YOU TO ACCOUNTANT</Link></li>
                            <li><Link className="dropdown-item" to="/service/solicitor">CONNECT YOU TO SOLICITOR</Link></li>
                        </ul>
                    )}
                </li> */}
                <li className="nav-item">
                    <Link className="nav-link" to="">Usefull resources</Link>
                </li>
                {/* Add Login Button */}
                <li className="nav-item login-item">
                    <Link className="nav-link login-btn" to="/login">Login / Signup</Link>
                </li>
            </ul>

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
        </nav>
    );
}

export default Navbar;