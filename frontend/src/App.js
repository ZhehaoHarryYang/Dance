import React, { useState } from 'react';
import VideoUploader from './components/VideoUploader';
import DanceGame from './components/DanceGame';

const App = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [poseData, setPoseData] = useState(null);
  
  const handleVideoUpload = (response) => {
    setVideoUrl(response.video_path);
    setPoseData(response.pose_file);
  };
  
  return (
    <div className="dance-app">
      <h1>Dance Game</h1>
      <VideoUploader onUpload={handleVideoUpload} />
      {videoUrl && (
        <DanceGame 
          videoUrl={videoUrl}
          poseData={poseData} 
        />
      )}
      
    </div>
  );
};

export default App;