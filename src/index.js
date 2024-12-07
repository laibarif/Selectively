import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link } from 'react-router-dom';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';
// import { ChakraProvider } from '@chakra-ui/react';


ReactDOM.render(
  // <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter> , 
  // </ChakraProvider>,
  document.getElementById('root')
);