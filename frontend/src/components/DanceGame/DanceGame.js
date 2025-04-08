import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils/drawing_utils.js';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import PoseDetection from '../PoseDetection/PoseDetection'; // Import the PoseDetection component


const DanceGame = ({ videoUrl, poseData }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameRef = useRef(null);
  const lastFrameRef = useRef(-1); // Keeps track of the last drawn frame
  const [poseFrames, setPoseFrames] = useState(null);
  const [videoTimestamp, setVideoTimestamp] = useState(0); // Store the video time
  const intervalRef = useRef(null); // Reference for the interval
  const [videoDuration, setVideoDuration] = useState(0); // Store total duration

  useEffect(() => {
    const checkVideo = () => {
      const video = videoRef.current;
      if (!video) {
        console.log("videoRef.current is still null, retrying...");
        setTimeout(checkVideo, 500); // Retry after 500ms
        return;
      }
  
      const handleMetadataLoaded = () => {
        setVideoDuration(video.duration);
      };
  
      video.addEventListener("loadedmetadata", handleMetadataLoaded);
  
      if (video.readyState >= 1) {
        handleMetadataLoaded();
      }
  
      return () => {
        video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      };
    };
  
    setTimeout(checkVideo, 500); // Initial retry delay
  }, []);
  
  
  const totalScore = Math.floor(videoDuration / 2) * 1000; // Calculate total score

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const updateCanvas = () => {
      if (video && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };
  
    if (video) {
      video.onloadedmetadata = updateCanvas;
      video.onresize = updateCanvas;
      updateCanvas(); // Initial sync
    }
  
    return () => {
      if (video) {
        video.onloadedmetadata = null;
        video.onresize = null;
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const loadPoseData = async () => {
      if (typeof poseData === 'string') {
        try {
          const response = await fetch(poseData);
          setPoseFrames(await response.json());
        } catch (error) {
          console.error("Error loading pose data:", error);
        }
      } else {
        setPoseFrames(poseData);
      }
    };
    loadPoseData();
  }, [poseData]);
  

  const drawPose = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const video = videoRef.current;
  
    if (!canvas || !ctx || !poseFrames || !video || video.paused || video.ended) return;
  
    // Round timestamp to the nearest even number (2, 4, 6...)
    const roundedTimestamp = Math.floor(video.currentTime / 2) * 2;
    if (roundedTimestamp < 0 || roundedTimestamp >= poseFrames.length) return;
  
    // Get the corresponding frame for the rounded timestamp
    const frameIndex = roundedTimestamp * 30; // Assuming 30 FPS
    if (lastFrameRef.current === frameIndex) return; // Prevent redundant re-drawing
  
    lastFrameRef.current = frameIndex; // Update last frame reference
  
    const currentFrameLandmarks = poseFrames[frameIndex]?.landmarks;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    if (currentFrameLandmarks) {
      drawLandmarks(ctx, currentFrameLandmarks, {
        color: '#FF0000', // Red landmarks
        radius: 1,
      });
  
      drawConnectors(ctx, currentFrameLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00', // Green lines
        lineWidth: 1,
      });
    }
  }, [poseFrames, videoTimestamp]); // Trigger redraw only when videoTimestamp changes
  
  
  
  
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawPose);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, drawPose]);
  
  // Send timestamp every second to PoseDetection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTimestamp = () => {
      const roundedTime = Math.floor(video.currentTime); // Round to nearest second
      setVideoTimestamp((prev) => (prev !== roundedTime ? roundedTime : prev)); // Update only if changed
    };

    if (isPlaying) {
      intervalRef.current = setInterval(updateTimestamp, 2000); // Update every 2 second
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);
  
  useEffect(() => {
    console.log("Video Timestamp:", videoTimestamp);
  }, [lastFrameRef, videoTimestamp]); // Log only when it updates

  // Start drawing when video plays
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(drawPose); // Start drawing loop
    } else {
      cancelAnimationFrame(animationFrameRef.current); // Stop drawing loop
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, poseFrames, drawPose]);

  // Reset frame and start drawing when video restarts
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.onplay = () => {
        lastFrameRef.current = -1; // Reset frame when video is played
        setIsPlaying(true);
      };

      video.onpause = () => {
        setIsPlaying(false);
      };

      // Restart drawing when video ends or starts over
      video.onended = () => {
        lastFrameRef.current = -1; // Reset frame when video ends
        setIsPlaying(false);
      };
    }
    
    return () => {
      if (video) {
        video.onplay = null;
        video.onpause = null;
        video.onended = null;
      }
    };
  }, []);


  return (
    <div className="dance-game-container">
      <div className="media-container">
        {/* Video Player */}
        <div className="video-container">
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            playsInline
            style={{ width: '100%', height: 'auto' }}
            controls // Add video controls
          />
        </div>
        <PoseDetection 
            isPlaying={isPlaying} 
            expectedPoseFilename={poseData} 
            videoTimestamp={videoTimestamp} 
            totalScoreVideo={totalScore} // Pass total score based on full duration
        />
        {/* Pose Visualization Canvas */}
        
      </div>
      <div className="canvas-container">
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: 'white', // Dark background for better visibility
            }}
          />
        </div>
    </div>
  );
};

export default DanceGame;
