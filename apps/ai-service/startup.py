#!/usr/bin/env python3
"""Startup script for ZundeNova AI Service"""

import os
import sys
import logging
from pathlib import Path

def setup_environment():
    """Setup environment variables and paths"""
    app_dir = Path(__file__).parent
    os.environ.setdefault("PYTHONPATH", str(app_dir))
    
    if not os.getenv("PLANT_DISEASE_MODEL_PATH"):
        os.environ["PLANT_DISEASE_MODEL_PATH"] = str(app_dir / "app" / "models" / "plantdiag.onnx")
    
    if not os.getenv("LIVESTOCK_MODEL_PATH"):
        os.environ["LIVESTOCK_MODEL_PATH"] = str(app_dir / "app" / "models" / "livestock.onnx")

def check_dependencies():
    """Check if required dependencies are available"""
    try:
        import fastapi
        import uvicorn
        import numpy
        import PIL
        print("✅ Core dependencies available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        sys.exit(1)
    
    try:
        import onnxruntime
        print("✅ ONNX Runtime available")
    except ImportError:
        print("⚠️ ONNX Runtime not available, will use mock models")

def main():
    """Main startup function"""
    print("🌱 Starting ZundeNova AI Service")
    print("=" * 40)
    
    setup_environment()
    check_dependencies()
    
    print("🚀 Environment ready, starting FastAPI server...")
    
    import uvicorn
    from main import app
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        log_level=os.getenv("LOG_LEVEL", "info").lower(),
        reload=os.getenv("RELOAD", "false").lower() == "true"
    )

if __name__ == "__main__":
    main()
