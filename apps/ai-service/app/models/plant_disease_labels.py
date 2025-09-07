PLANT_DISEASE_LABELS = [
    "Healthy",
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

LIVESTOCK_HEALTH_LABELS = [
    "Healthy_Cattle",
    "Cattle_Mastitis",
    "Cattle_Foot_Rot",
    "Cattle_Pink_Eye",
    "Cattle_Respiratory_Disease",
    "Healthy_Poultry",
    "Poultry_Newcastle_Disease",
    "Poultry_Fowl_Pox",
    "Poultry_Coccidiosis",
    "Healthy_Goat",
    "Goat_Pneumonia",
    "Goat_Foot_Rot",
    "Healthy_Sheep",
    "Sheep_Foot_Rot",
    "Sheep_Pneumonia"
]

def get_disease_treatment_url(disease_label: str) -> str:
    """Generate treatment URL for a given disease label"""
    clean_label = disease_label.lower().replace(" ", "-").replace("_", "-")
    return f"https://zundenova.com/treatments/{clean_label}"

def map_prediction_to_disease(scores: list, labels: list = None) -> str:
    """Map prediction scores to disease label"""
    if labels is None:
        labels = PLANT_DISEASE_LABELS
    
    max_index = scores.index(max(scores))
    if max_index < len(labels):
        return labels[max_index]
    return "Unknown_Disease"
