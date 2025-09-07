# ZundeNova AI Service

FastAPI-based AI service providing computer vision diagnostics, geo NDVI analysis, and chat functionality with ONNX runtime support.

## Features

- **Vision Diagnostics**: Plant disease detection using ONNX models
- **Geo NDVI**: Field health analysis and vegetation monitoring
- **AI Chat**: Multilingual agricultural assistant
- **ONNX Runtime**: Optimized model inference

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Place ONNX models in `app/models/` directory

3. Run the service:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /vision/diagnose` - Plant disease diagnosis
- `POST /geo/ndvi` - NDVI field analysis
- `POST /chat` - AI chat assistant
- `GET /health` - Health check

## Docker

Build and run with Docker:
```bash
docker build -t zundenova-ai .
docker run -p 8000:8000 zundenova-ai
```
