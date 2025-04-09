import React from 'react';
import DanceGame from '../components/DanceGame/DanceGame';

const DemoApp = () => (
  <DanceGame 
    videoUrl={`${process.env.PUBLIC_URL}/dances/demo-video.mp4`}
    poseData={`${process.env.PUBLIC_URL}/dances/demo-poses.json`}
  />

  // <div className="video-container">
  //   <video
  //     src={`${process.env.PUBLIC_URL}/dances/demo-video.mp4`}
  //     muted
  //     playsInline
  //     style={{ width: '100%', height: 'auto' }}
  //     controls // Add video controls
  //   />
  // </div>
);

export default DemoApp;