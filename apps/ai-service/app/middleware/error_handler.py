from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.core.logging import logger
import traceback

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if logger.level <= 10 else "An unexpected error occurred"
        }
    )

async def validation_exception_handler(request: Request, exc: Exception):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": str(exc)
        }
    )
