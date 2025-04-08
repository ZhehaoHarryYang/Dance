import cv2
import mediapipe as mp

# Initialize MediaPipe Pose once (reusable across requests)
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils

def process_video(input_video_path, output_video_path):
    """Process video for pose detection, save output video, and extract pose data."""
    cap = cv2.VideoCapture(input_video_path)
    if not cap.isOpened():
        print("Error: Couldn't open video file")
        return None

    # H.264 codec for compatibility
    fourcc = cv2.VideoWriter_fourcc(*'X264')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width, height = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    pose_model = mp_pose.Pose()  # Initialize Pose model
    extracted_poses = []  # Store extracted poses

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Convert to RGB (MediaPipe works with RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Perform pose detection
        results = pose_model.process(rgb_frame)
        
        # Draw landmarks if detected
        if results.pose_landmarks:
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Extract pose landmarks
            landmarks = [{'x': lm.x, 'y': lm.y, 'z': lm.z} for lm in results.pose_landmarks.landmark]
            extracted_poses.append({'time': cap.get(cv2.CAP_PROP_POS_MSEC) / 1000, 'landmarks': landmarks})

        # Write frame to output video
        out.write(frame)

    # Release resources
    cap.release()
    out.release()

    return extracted_poses  # Return pose data with timestamps

def calculate_pose_score(player_pose, expected_poses):
    # Define important joints (ignore fingers and minor wrist details)
    important_joints = {
        11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28  # Shoulders, elbows, hips, knees, ankles
    }
    
    # Extract timestamps from expected poses
    expected_times = [pose['time'] for pose in expected_poses]

    # Find the closest timestamp in expected poses
    closest_idx = min(range(len(expected_times)), key=lambda i: abs(expected_times[i] - player_pose['time']))
    closest_expected_pose = expected_poses[closest_idx]['landmarks']

    # Compute similarity score between the player's pose and the closest expected pose
    score = 0
    weight_sum = 0
    joint_weights = {11: 1.2, 12: 1.2, 13: 1.5, 14: 1.5, 15: 1.5, 16: 1.5, 23: 1.8, 24: 1.8, 25: 2.0, 26: 2.0, 27: 2.0, 28: 2.0}  # Higher weight for legs
    
    for idx in important_joints:
        pl, el = player_pose['landmarks'][idx], closest_expected_pose[idx]
        dx = pl['x'] - el['x']
        dy = pl['y'] - el['y']
        dz = pl['z'] - el['z']
        dist = (dx**2 + dy**2 + dz**2)**0.5  # Euclidean distance
        weight = joint_weights.get(idx, 1.0)
        score += weight * dist
        weight_sum += weight
    
    # Normalize score and invert (higher is better)
    final_score = int(1000 / (1 + (score / weight_sum))) if weight_sum > 0 else 0
    return final_score

# The scoring now prioritizes key movement joints and ignores fingers for better accuracy.


