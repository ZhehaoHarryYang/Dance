// App.js (Main Entry Point)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-brand">
            <Link to="/">DanceAI</Link>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/demo">Try Demo</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Routes>

        <footer className="app-footer">
          <p>© 2024 DanceAI. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;