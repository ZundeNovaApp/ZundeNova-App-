import numpy as np
from typing import List, Tuple

class MockPlantDiseaseModel:
    """Mock plant disease model for demonstration purposes"""
    
    def __init__(self):
        self.disease_labels = [
            "Healthy", "Bacterial Blight", "Brown Spot", 
            "Leaf Smut", "Blast Disease", "Nutrient Deficiency"
        ]
    
    def predict(self, image_array: np.ndarray) -> List[float]:
        """Generate mock predictions based on image characteristics"""
        np.random.seed(int(np.sum(image_array) % 1000))
        
        scores = np.random.dirichlet(np.ones(len(self.disease_labels)))
        
        mean_intensity = np.mean(image_array)
        if mean_intensity > 0.7:
            scores[0] *= 2.0
        elif mean_intensity < 0.3:
            scores[1:] *= 1.5
        
        scores = scores / np.sum(scores)
        return scores.tolist()

def get_mock_model():
    """Return mock model instance"""
    return MockPlantDiseaseModel()
