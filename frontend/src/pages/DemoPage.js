// DemoPage.js
import React from 'react';
import DanceGame from '../components/DanceGame/DanceGame';
import './DemoPage.css';

const DemoPage = () => {
  return (
    <div className="demo-container">
      <div className="demo-content-wrapper">
        <h2 className="demo-title">Interactive Dance Demo</h2>
        
        <div className="demo-main-content">
            <div className="demo-instructions">
                <h3>How to Use:</h3>
                <ol>
                <li>Stand 6 feet from your camera</li>
                <li>Ensure good lighting</li>
                <li>Follow the on-screen guide</li>
                <li>Match the dancer's movements</li>
                </ol>
            </div>

            <div className="dance-game-wrapper">
                <DanceGame 
                videoUrl={`${process.env.PUBLIC_URL}/dances/demo-video.mp4`}
                poseData={`${process.env.PUBLIC_URL}/dances/demo-poses.json`}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;