import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple

def decode_base64_image(image_base64: str) -> Image.Image:
    """Decode base64 string to PIL Image"""
    image_data = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_data))
    return image.convert('RGB')

def preprocess_image(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """Preprocess image for model inference"""
    image = image.resize(target_size)
    img_array = np.array(image).astype(np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))[None, :]
    return img_array

def validate_image_format(image_base64: str) -> bool:
    """Validate if the base64 string represents a valid image"""
    try:
        decode_base64_image(image_base64)
        return True
    except Exception:
        return False
