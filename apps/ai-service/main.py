from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.routers import vision, geo, chat
from app.routers import livestock
from app.core.config import settings
from app.core.logging import logger
from app.middleware.error_handler import global_exception_handler, validation_exception_handler
import uvicorn
from datetime import datetime

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vision.router, prefix="/vision", tags=["vision"])
app.include_router(geo.router, prefix="/geo", tags=["geo"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(livestock.router, prefix="/livestock", tags=["livestock"])

app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Plant disease model path: {settings.PLANT_DISEASE_MODEL_PATH}")

@app.get("/")
def root():
    return {
        "status": "ZundeNova AI API running",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
def health_check():
    from app.services.health_service import health_service
    return health_service.get_health_status()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
