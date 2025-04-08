from setuptools import setup, find_packages

setup(
    name="dance_backend",
    version="0.1",
    packages=find_packages(include=["backend*"]),
    install_requires=[
        "flask",
        "flask-cors",
        "mediapipe",
        "opencv-python",
    ],
)