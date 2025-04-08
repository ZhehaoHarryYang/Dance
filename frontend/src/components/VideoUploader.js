import React, { useState } from 'react';
import { uploadVideo } from '../services/api';

const VideoUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      console.error("No file selected!");
      return;
    }
    
    try {
      const response = await uploadVideo(file);
      
      if (response.data.pose_file) {
        onUpload({
            video_path: response.data.video_path,
            pose_file: response.data.pose_file
        });
      } else {
        console.error("No video URL in response");
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="uploader">
      <h2>Upload Dance Video</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept="video/*" 
          onChange={(e) => {
            setFile(e.target.files[0]);
          }} 
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default VideoUploader;
