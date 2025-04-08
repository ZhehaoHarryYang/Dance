import os
import json

def test_upload_video(test_client):
    # Get absolute path to sample video
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sample_video_path = os.path.join(current_dir, 'sample_video.mp4')
    
    data = {
        'file': (open(sample_video_path, 'rb'), 'sample_video.mp4')
    }
    
    response = test_client.post(
        '/api/upload',
        data=data,
        content_type='multipart/form-data'
    )
    assert response.status_code == 200
    assert 'pose_file' in response.json

    # Check if files were saved
    assert os.path.exists(os.path.join('test_uploads', 'sample_video.mp4'))
    pose_path = os.path.join('test_poses', response.json['pose_file'])
    assert os.path.exists(pose_path)

def test_calculate_score(test_client):
    # Mock pose data
    player_pose = [{'x': 0.5, 'y': 0.5, 'z': 0}]
    expected_pose = [{'x': 0.5, 'y': 0.5, 'z': 0}]
    
    response = test_client.post(
        '/api/score',
        json={'pose': player_pose, 'expected_pose': expected_pose}
    )
    assert response.status_code == 200
    assert response.json['score'] == 1000