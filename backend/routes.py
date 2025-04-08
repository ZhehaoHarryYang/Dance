from flask import request, jsonify, send_from_directory
import re
import os
import json
from .config import Config
from .utils.pose_utils import calculate_pose_score, process_video

base_url = "http://localhost:5000/api"


def register_routes(app):

    def sanitize_filename(filename):
        """Sanitize filename by replacing spaces and removing special characters."""
        filename = filename.replace(" ", "_")  # Replace spaces with underscores
        filename = re.sub(r'[^\w.-]', '', filename)  # Remove special characters except letters, numbers, underscores, hyphens, and dots
        return filename

    @app.route('/api/uploads', methods=['POST'])
    def upload_video():
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        # Sanitize the filename
        safe_filename = sanitize_filename(file.filename)

        # Save the uploaded video
        filename = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(filename)

        # Save poses as JSON
        pose_filename = f"{os.path.splitext(safe_filename)[0]}_poses.json"
        pose_path = os.path.join(app.config['POSES_FOLDER'], pose_filename)

        # Process the video to add the pose stickman on it
        processed_filename = f"{os.path.splitext(safe_filename)[0]}_processed.mp4"
        processed_video_path = os.path.join(app.config['UPLOAD_FOLDER'], processed_filename)
        poses = process_video(filename, processed_video_path)  # Call the function to process the video

        with open(pose_path, 'w') as f:
            json.dump(poses, f)

        # Return video path, pose file, and processed video
        return jsonify({
            'pose_file': f"{base_url}/poses/{pose_filename}",
            'video_path': f"{base_url}/videos/{processed_filename}"  # Public URL for the processed video
        })

    @app.route("/api/userPose", methods=["POST"])
    def receive_pose():
        data = request.json
        if "landmarks" in data:
            return jsonify({"message": "Pose data received"}), 200
        return jsonify({"error": "Invalid data"}), 400

    # Route to serve uploaded videos
    @app.route('/api/videos/<filename>')
    def serve_video(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Route to serve pose JSON files
    @app.route('/api/poses/<filename>')
    def serve_pose(filename):
        return send_from_directory(app.config['POSES_FOLDER'], filename)

    @app.route("/api/score", methods=["POST"])
    def calculate_score():
        data = request.json
        player_pose = data.get("pose")
        expected_pose_filename = data.get("expected_pose_filename")
        if not player_pose or not expected_pose_filename:
            return jsonify({"error": "Missing pose data or expected pose filename"}), 400

        # Get the expected pose from the filesystem
        expected_pose_path = os.path.join(app.config['POSES_FOLDER'], expected_pose_filename)

        if not os.path.exists(expected_pose_path):
            return jsonify({"error": f"Expected pose file {expected_pose_filename} not found"}), 404
        
        # Load the expected pose from the file
        try:
            with open(expected_pose_path, 'r') as f:
                expected_pose = json.load(f)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format in the expected pose file"}), 400
        # Calculate score based on the player's pose and the expected pose
        score = calculate_pose_score(player_pose, expected_pose)

        return jsonify({"score": score})