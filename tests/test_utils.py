import json
from backend.utils.pose_utils import extract_poses, calculate_pose_score

def test_calculate_pose_score():
    # Mock player and expected poses
    player_pose = [{'x': 0.5, 'y': 0.5, 'z': 0}]
    expected_pose = [{'x': 0.5, 'y': 0.5, 'z': 0}]
    assert calculate_pose_score(player_pose, expected_pose) == 1000  # Perfect score

    player_pose = [{'x': 1.0, 'y': 1.0, 'z': 0}]
    expected_pose = [{'x': 0.5, 'y': 0.5, 'z': 0}]
    score = calculate_pose_score(player_pose, expected_pose)
    assert 0 < score < 1000  # Imperfect score

def test_extract_poses(tmp_path):
    # Create a dummy video (replace with a real test video)
    video_path = tmp_path / "test_video.mp4"
    with open(video_path, 'wb') as f:
        f.write(b'dummy_video_data')
    
    # Test pose extraction (mock this if MediaPipe is too slow)
    poses = extract_poses(str(video_path))
    assert isinstance(poses, list)