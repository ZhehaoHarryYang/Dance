import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Flask backend URL
});

export const uploadVideo = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/uploads', formData);
};

// ✅ Send real-time pose landmarks to the backend
export const sendPoseLandmarks = (landmarks) => {
  return API.post('/userPose', { landmarks });
};

export const calculateScore = (pose, expected_pose_filename) => {
  return API.post('/score', {
    pose: pose,  // Player's pose data
    expected_pose_filename: expected_pose_filename, // Expected pose file name (e.g., "pose1.json")
  });
};