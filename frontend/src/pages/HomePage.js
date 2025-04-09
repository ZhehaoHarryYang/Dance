// pages/HomePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoUploader from '../components/VideoUploader';
import DanceGame from '../components/DanceGame/DanceGame';
import './HomePage.css';

const HomePage = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [poseData, setPoseData] = useState(null);

  const handleVideoUpload = (uploadedVideo, uploadedPoseData) => {
    setVideoUrl(uploadedVideo);
    setPoseData(uploadedPoseData);
  };

  return (
    <div className="home-container">
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Transform Your Dance Practice <span className="ai-badge">with AI</span></h1>
            <p className="hero-subtitle">Upload your video for real-time feedback or explore our interactive demo</p>
            
            <div className="cta-container">
              <div className="upload-cta">
                <VideoUploader onUpload={handleVideoUpload} />
                <p className="cta-note">Supports MP4, MOV, AVI (max 5min)</p>
              </div>
              
              <div className="demo-cta">
                <div className="separator-line">
                  <span>or</span>
                </div>
                <Link to="/demo" className="cta-button demo-button">
                  <span className="button-icon">🎬</span>
                  Try Our Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoUrl && (
        <section className="live-preview-section">
          <div className="preview-header">
            <h2>Live Analysis Session</h2>
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Analyzing Movements</span>
            </div>
          </div>
          <div className="analysis-container">
            <DanceGame 
              videoUrl={videoUrl}
              poseData={poseData} 
            />
            <div className="analysis-sidebar">
              <h3>Performance Tips</h3>
              <ul className="feedback-list">
                <li>Keep your shoulders aligned</li>
                <li>Bend knees slightly more</li>
                <li>Sync with the rhythm</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      <section className="features-section">
        <div className="feature-card">
          <h3>How It Works</h3>
          <ol className="instructions-list">
            <li>Upload your dance video</li>
            <li>We analyze your movements</li>
            <li>Get instant feedback</li>
          </ol>
        </div>
        <div className="feature-card">
          <h3>Supported Formats</h3>
          <ul className="format-list">
            <li>MP4, MOV, AVI</li>
            <li>Up to 1080p resolution</li>
            <li>Max 5 minute duration</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default HomePage;