from flask import Flask
from flask_cors import CORS
from backend.config import Config  # Absolute import
from backend.routes import register_routes

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS
    app.config.from_object(Config)
    Config.init_app(app)  # Create upload directories
    register_routes(app)  # Register API routes
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)