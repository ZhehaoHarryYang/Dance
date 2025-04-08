import os

class Config:
    UPLOAD_FOLDER = 'uploads'
    POSES_FOLDER = 'poses'
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

    @classmethod
    def init_app(cls, app):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        os.makedirs(app.config['POSES_FOLDER'], exist_ok=True)