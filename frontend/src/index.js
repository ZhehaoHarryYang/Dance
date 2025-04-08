import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the correct package for React 18
import './index.css'; // Import the global styles
import App from './App'; // Import the App component

// ReactDOM renders the App component into the root element in the HTML
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
