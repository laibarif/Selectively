import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link } from 'react-router-dom';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
import { AuthProvider } from '../src/Frontend/Context/authContext';
// import { ChakraProvider } from '@chakra-ui/react';


ReactDOM.render(
  // <ChakraProvider>
  <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter> 
      </AuthProvider>,
  // </ChakraProvider>,
  document.getElementById('root')
);