import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { sendPoseLandmarks, calculateScore } from "../../services/api";
import ProgressBar from "../ProgressBar";

const PoseDetection = ({ isPlaying, expectedPoseFilename, videoTimestamp, totalScoreVideo }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseModel, setPoseModel] = useState(null);
  const [score, setScore] = useState(0);
  const [scoreError, setScoreError] = useState(null);
  const processingRef = useRef(false);
  const videoTimestampRef = useRef(videoTimestamp);
  const parsedUrl = new URL(expectedPoseFilename);
  const filename = parsedUrl.pathname.split('/').pop();
  const [totalScore, setTotalScore] = useState(0); 
  const lastProcessedTimestampRef = useRef(null); // Store the last processed timestamp

  useEffect(() => {
    console.log("Updating totalScore to:", totalScoreVideo);
    setTotalScore(totalScoreVideo); // Sync state when totalScoreVideo updates
  }, [totalScoreVideo]); // Runs when totalScoreVideo changes

  const onPoseResults = useCallback(async (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !results.poseLandmarks) return;
  
    const currentTimestamp = videoTimestampRef.current;
  
    // Ensure we only send one pose per timestamp
    if (currentTimestamp === lastProcessedTimestampRef.current) {
      return;
    }
    lastProcessedTimestampRef.current = currentTimestamp;
  
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Flip landmarks horizontally
    const flippedLandmarks = results.poseLandmarks.map(landmark => ({
      ...landmark,
      x: 1 - landmark.x, // Flip x-coordinate
    }));
  
    // Draw flipped landmarks
    flippedLandmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        5, // Radius of the landmark dot
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "red";
      ctx.fill();
    });
  
    // Draw connections between landmarks
    ctx.strokeStyle = "#00FF00"; // Green lines
    ctx.lineWidth = 2;
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startLandmark = flippedLandmarks[startIdx];
      const endLandmark = flippedLandmarks[endIdx];
  
      if (startLandmark && endLandmark) {
        ctx.beginPath();
        ctx.moveTo(startLandmark.x * canvas.width, startLandmark.y * canvas.height);
        ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
        ctx.stroke();
      }
    });
  
    // Prepare data
    const landmarksWithTimestamp = {
      time: currentTimestamp,
      landmarks: flippedLandmarks.map(landmark => ({
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility,
      })),
    };
    console.log(landmarksWithTimestamp);
  
    try {
      await sendPoseLandmarks(landmarksWithTimestamp);
  
      if (filename) {
        const scoreResponse = await calculateScore(landmarksWithTimestamp, filename);
  
        
        setScore((prevScore) => prevScore + scoreResponse.data.score);
      }
    } catch (error) {
      console.error("Error:", error);
      setScoreError(error.message);
    }
  }, [filename]);
  
  

  // Sync timestamp ref
  useEffect(() => {
    videoTimestampRef.current = videoTimestamp;
    // Reset score if videoTimestamp is close to 0 and video is playing
    if (isPlaying && Math.abs(videoTimestamp) <3) {
      setScore(0);
      setScoreError(null);
    }
  }, [isPlaying, videoTimestamp]);

  // Canvas dimension sync
  useEffect(() => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }, [webcamRef.current?.video?.readyState]);

  // Pose model initialization
  useEffect(() => {
    const initialize = async () => {
      await tf.setBackend('webgl');
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onPoseResults);
      setPoseModel(pose);
    };

    initialize();
    return () => {
      if (poseModel) poseModel.close();
    };
  }, [onPoseResults]);

  // Frame processing
  const processVideo = useCallback(async () => {
    if (processingRef.current || !webcamRef.current || !poseModel) return;
    processingRef.current = true;

    try {
      if (webcamRef.current.video.readyState === 4) {
        await poseModel.send({ image: webcamRef.current.video });
      }
    } finally {
      processingRef.current = false;
    }
  }, [poseModel]);



  // Processing loop
  useEffect(() => {
    if (!poseModel || !isPlaying) return;
    const interval = setInterval(processVideo, 33);
    return () => clearInterval(interval);
  }, [poseModel, isPlaying, processVideo]);

  return (
    <div className="pose-container" >
      <div style={{ position: "relative" }}>
        <Webcam
          ref={webcamRef}
          style={{
            width: "100%", 
            transform: "scaleX(-1)", // Flip the webcam feed horizontally
          }}
          videoConstraints={{
            facingMode: "user",
            width: 1920,
            height: 1080,
            aspectRatio: 16/9
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        />

      </div>
      <div className="score-display">
        {scoreError ? (
          <div className="error">{scoreError}</div>
        ) : (
          <div>
            <ProgressBar score={score} totalScore={totalScore} /> {/* Use the ProgressBar */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoseDetection;