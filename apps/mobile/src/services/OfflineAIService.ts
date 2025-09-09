import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Platform } from 'react-native';

interface DiagnosisResult {
  diseases: Array<{
    label: string;
    score: number;
    treatment_uri: string;
  }>;
  confidence: number;
  isOffline: boolean;
  severity: string;
}

interface LivestockDiagnosisResult {
  condition: string;
  confidence: number;
  severity: string;
  treatment_recommendations: string[];
  veterinary_consultation_required: boolean;
  isOffline: boolean;
}

class OfflineAIService {
  private plantModel: tf.LayersModel | null = null;
  private livestockModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      await tf.ready();
      
      if (Platform.OS === 'ios') {
        tf.ENV.set('WEBGL_PACK', false);
      }

      await this.loadModels();
      this.isInitialized = true;
      console.log('✅ Offline AI Service initialized');
    } catch (error) {
      console.warn('⚠️ Offline AI models not available, using cloud fallback:', error);
    }
  }

  private async loadModels() {
    try {
      const plantModelUrl = Platform.select({
        ios: 'bundleResource://plant_disease_model',
        android: 'file:///android_asset/plant_disease_model.json'
      });

      const livestockModelUrl = Platform.select({
        ios: 'bundleResource://livestock_health_model',
        android: 'file:///android_asset/livestock_health_model.json'
      });

      if (plantModelUrl) {
        this.plantModel = await tf.loadLayersModel(plantModelUrl);
        console.log('✅ Plant disease model loaded');
      }

      if (livestockModelUrl) {
        this.livestockModel = await tf.loadLayersModel(livestockModelUrl);
        console.log('✅ Livestock health model loaded');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load offline models:', error);
    }
  }

  async diagnosePlantOffline(imageUri: string): Promise<DiagnosisResult | null> {
    if (!this.plantModel) {
      console.log('Plant model not available, using cloud fallback');
      return null;
    }

    try {
      const response = await fetch(imageUri);
      const imageData = await response.arrayBuffer();
      const imageTensor = tf.browser.fromPixels(new ImageData(new Uint8ClampedArray(imageData), 224, 224), 3);
      
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);

      const predictions = this.plantModel.predict(batched) as tf.Tensor;
      const scores = await predictions.data();

      const diseases = this.mapScoresToDiseases(Array.from(scores));
      const maxScore = Math.max(...Array.from(scores));

      imageTensor.dispose();
      resized.dispose();
      normalized.dispose();
      batched.dispose();
      predictions.dispose();

      return {
        diseases: diseases.slice(0, 3),
        confidence: maxScore,
        isOffline: true,
        severity: maxScore > 0.8 ? 'high' : maxScore > 0.6 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Offline plant diagnosis failed:', error);
      return null;
    }
  }

  async diagnoseLivestockOffline(symptoms: string[], animalType: string): Promise<LivestockDiagnosisResult | null> {
    if (!this.livestockModel) {
      console.log('Livestock model not available, using cloud fallback');
      return null;
    }

    try {
      const symptomVector = this.encodeSymptoms(symptoms, animalType);
      const inputTensor = tf.tensor2d([symptomVector]);

      const predictions = this.livestockModel.predict(inputTensor) as tf.Tensor;
      const scores = await predictions.data();

      const result = this.mapLivestockScores(Array.from(scores), animalType);

      inputTensor.dispose();
      predictions.dispose();

      return {
        ...result,
        isOffline: true
      };
    } catch (error) {
      console.error('Offline livestock diagnosis failed:', error);
      return null;
    }
  }

  private mapScoresToDiseases(scores: number[]) {
    const diseaseLabels = [
      'Healthy Plant',
      'Early Blight',
      'Late Blight',
      'Leaf Spot',
      'Powdery Mildew',
      'Rust',
      'Bacterial Wilt',
      'Viral Infection',
      'Nutrient Deficiency',
      'Pest Damage'
    ];

    return scores.map((score, index) => ({
      label: diseaseLabels[index] || `Disease ${index}`,
      score,
      treatment_uri: `https://zundenova.com/treatments/${diseaseLabels[index]?.toLowerCase().replace(/\s+/g, '-')}`
    })).sort((a, b) => b.score - a.score);
  }

  private encodeSymptoms(symptoms: string[], animalType: string): number[] {
    const symptomMap = {
      'coughing': 0, 'fever': 1, 'lameness': 2, 'diarrhea': 3,
      'loss_of_appetite': 4, 'lethargy': 5, 'discharge': 6, 'swelling': 7
    };

    const animalTypeMap = {
      'cattle': 0, 'goat': 1, 'sheep': 2, 'pig': 3, 'chicken': 4
    };

    const vector = new Array(20).fill(0);
    
    symptoms.forEach(symptom => {
      const index = symptomMap[symptom.toLowerCase().replace(/\s+/g, '_') as keyof typeof symptomMap];
      if (index !== undefined) {
        vector[index] = 1;
      }
    });

    const typeIndex = animalTypeMap[animalType.toLowerCase() as keyof typeof animalTypeMap];
    if (typeIndex !== undefined) {
      vector[10 + typeIndex] = 1;
    }

    return vector;
  }

  private mapLivestockScores(scores: number[], animalType: string): Omit<LivestockDiagnosisResult, 'isOffline'> {
    const conditions = [
      'Healthy Animal',
      'Respiratory Infection',
      'Foot Rot',
      'Digestive Issues',
      'Parasitic Infection',
      'Nutritional Deficiency'
    ];

    const maxIndex = scores.indexOf(Math.max(...scores));
    const confidence = scores[maxIndex];
    const condition = conditions[maxIndex] || 'Unknown Condition';

    const treatments = {
      'Healthy Animal': ['Continue regular care', 'Monitor for changes'],
      'Respiratory Infection': ['Isolate animal', 'Provide clean environment', 'Consult veterinarian'],
      'Foot Rot': ['Clean affected hooves', 'Apply topical treatment', 'Keep in dry area'],
      'Digestive Issues': ['Adjust diet', 'Provide clean water', 'Monitor closely'],
      'Parasitic Infection': ['Deworm as recommended', 'Improve hygiene', 'Quarantine if needed'],
      'Nutritional Deficiency': ['Adjust feed composition', 'Add supplements', 'Consult nutritionist']
    };

    return {
      condition,
      confidence,
      severity: confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low',
      treatment_recommendations: treatments[condition as keyof typeof treatments] || ['Consult veterinarian'],
      veterinary_consultation_required: confidence > 0.7 && condition !== 'Healthy Animal'
    };
  }

  dispose() {
    if (this.plantModel) {
      this.plantModel.dispose();
    }
    if (this.livestockModel) {
      this.livestockModel.dispose();
    }
    this.isInitialized = false;
  }
}

export const offlineAIService = new OfflineAIService();
