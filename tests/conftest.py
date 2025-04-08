import pytest
from backend.app import create_app  # Explicitly reference the `backend` package
import os

@pytest.fixture(scope='module')
def test_client():
    # Create test directories
    os.makedirs('test_uploads', exist_ok=True)
    os.makedirs('test_poses', exist_ok=True)
    
    app = create_app()
    app.config.update({
        'TESTING': True,
        'UPLOAD_FOLDER': 'test_uploads',
        'POSES_FOLDER': 'test_poses'
    })

    with app.test_client() as client:
        with app.app_context():
            yield client

    # Cleanup test directories after tests
    for f in os.listdir('test_uploads'):
        os.remove(os.path.join('test_uploads', f))
    os.rmdir('test_uploads')
    
    for f in os.listdir('test_poses'):
        os.remove(os.path.join('test_poses', f))
    os.rmdir('test_poses')