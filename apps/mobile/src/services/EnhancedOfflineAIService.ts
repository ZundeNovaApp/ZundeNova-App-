import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { offlineStorageService } from './OfflineStorageService';

interface AIModel {
  name: string;
  version: string;
  type: 'plant_disease' | 'livestock_health' | 'soil_analysis' | 'pest_detection';
  modelUrl: string;
  labelsUrl: string;
  inputShape: number[];
  confidence_threshold: number;
}

interface DiagnosisResult {
  predictions: Prediction[];
  confidence: number;
  isOffline: boolean;
  modelVersion: string;
  timestamp: number;
  recommendations: string[];
}

interface Prediction {
  label: string;
  confidence: number;
  description: string;
  treatment?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class EnhancedOfflineAIService {
  private models: Map<string, tf.LayersModel> = new Map();
  private labels: Map<string, string[]> = new Map();
  private availableModels: AIModel[] = [];
  private isInitialized = false;

  constructor() {
    this.availableModels = [
      {
        name: 'plant_disease_v2',
        version: '2.1.0',
        type: 'plant_disease',
        modelUrl: 'bundleResource://models/plant_disease_v2.json',
        labelsUrl: 'bundleResource://models/plant_disease_labels.json',
        inputShape: [224, 224, 3],
        confidence_threshold: 0.7
      },
      {
        name: 'livestock_health_v1',
        version: '1.3.0',
        type: 'livestock_health',
        modelUrl: 'bundleResource://models/livestock_health_v1.json',
        labelsUrl: 'bundleResource://models/livestock_health_labels.json',
        inputShape: [224, 224, 3],
        confidence_threshold: 0.6
      },
      {
        name: 'soil_analysis_v1',
        version: '1.0.0',
        type: 'soil_analysis',
        modelUrl: 'bundleResource://models/soil_analysis_v1.json',
        labelsUrl: 'bundleResource://models/soil_analysis_labels.json',
        inputShape: [224, 224, 3],
        confidence_threshold: 0.65
      },
      {
        name: 'pest_detection_v1',
        version: '1.2.0',
        type: 'pest_detection',
        modelUrl: 'bundleResource://models/pest_detection_v1.json',
        labelsUrl: 'bundleResource://models/pest_detection_labels.json',
        inputShape: [224, 224, 3],
        confidence_threshold: 0.75
      }
    ];
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Enhanced Offline AI Service...');
      
      await tf.ready();
      
      for (const modelConfig of this.availableModels) {
        try {
          await this.loadModel(modelConfig);
        } catch (error) {
          console.warn(`Failed to load model ${modelConfig.name}:`, error);
        }
      }
      
      this.isInitialized = true;
      console.log(`Enhanced Offline AI Service initialized with ${this.models.size} models`);
    } catch (error) {
      console.error('Failed to initialize Enhanced Offline AI Service:', error);
      throw error;
    }
  }

  private async loadModel(modelConfig: AIModel): Promise<void> {
    try {
      const cachedModel = await this.getCachedModel(modelConfig.name);
      if (cachedModel) {
        this.models.set(modelConfig.name, cachedModel);
        console.log(`Loaded cached model: ${modelConfig.name}`);
        return;
      }

      const model = await tf.loadLayersModel(modelConfig.modelUrl);
      this.models.set(modelConfig.name, model);

      const labels = await this.loadLabels(modelConfig.labelsUrl);
      this.labels.set(modelConfig.name, labels);

      await this.cacheModel(modelConfig.name, model);
      
      console.log(`Loaded model: ${modelConfig.name} v${modelConfig.version}`);
    } catch (error) {
      console.error(`Failed to load model ${modelConfig.name}:`, error);
      throw error;
    }
  }

  private async loadLabels(labelsUrl: string): Promise<string[]> {
    try {
      const mockLabels = {
        'plant_disease': [
          'Healthy',
          'Bacterial Blight',
          'Brown Spot',
          'Leaf Smut',
          'Bacterial Leaf Streak',
          'Tungro',
          'Blast',
          'Dead Heart',
          'Downy Mildew',
          'Hispa',
          'Brown Plant Hopper'
        ],
        'livestock_health': [
          'Healthy',
          'Respiratory Infection',
          'Foot Rot',
          'Mastitis',
          'Parasitic Infection',
          'Nutritional Deficiency',
          'Skin Disease',
          'Eye Infection',
          'Digestive Issues',
          'Lameness'
        ],
        'soil_analysis': [
          'Fertile Soil',
          'Nutrient Deficient',
          'High Acidity',
          'High Alkalinity',
          'Poor Drainage',
          'Compacted Soil',
          'Organic Matter Deficient',
          'Saline Soil'
        ],
        'pest_detection': [
          'No Pests',
          'Aphids',
          'Caterpillars',
          'Whiteflies',
          'Thrips',
          'Spider Mites',
          'Leaf Miners',
          'Scale Insects',
          'Mealybugs',
          'Beetles'
        ]
      };

      const labelType = labelsUrl.includes('plant_disease') ? 'plant_disease' :
                       labelsUrl.includes('livestock_health') ? 'livestock_health' :
                       labelsUrl.includes('soil_analysis') ? 'soil_analysis' :
                       labelsUrl.includes('pest_detection') ? 'pest_detection' : 'plant_disease';

      return mockLabels[labelType] || mockLabels['plant_disease'];
    } catch (error) {
      console.error('Failed to load labels:', error);
      return ['Unknown'];
    }
  }

  async diagnosePlantOffline(imageData: ImageData, cropType?: string): Promise<DiagnosisResult> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    const model = this.models.get('plant_disease_v2');
    const labels = this.labels.get('plant_disease_v2');
    
    if (!model || !labels) {
      throw new Error('Plant disease model not available offline');
    }

    try {
      const tensor = await this.preprocessImage(imageData, [224, 224, 3]);
      
      const predictions = await model.predict(tensor) as tf.Tensor;
      const scores = await predictions.data();
      
      const results = this.processResults(Array.from(scores), labels, 0.7);
      
      const recommendations = this.generatePlantRecommendations(results, cropType);
      
      tensor.dispose();
      predictions.dispose();

      return {
        predictions: results,
        confidence: Math.max(...results.map(r => r.confidence)),
        isOffline: true,
        modelVersion: '2.1.0',
        timestamp: Date.now(),
        recommendations
      };
    } catch (error) {
      console.error('Plant diagnosis failed:', error);
      throw error;
    }
  }

  async diagnoseLivestockOffline(imageData: ImageData, animalType?: string): Promise<DiagnosisResult> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    const model = this.models.get('livestock_health_v1');
    const labels = this.labels.get('livestock_health_v1');
    
    if (!model || !labels) {
      throw new Error('Livestock health model not available offline');
    }

    try {
      const tensor = await this.preprocessImage(imageData, [224, 224, 3]);
      const predictions = await model.predict(tensor) as tf.Tensor;
      const scores = await predictions.data();
      
      const results = this.processResults(Array.from(scores), labels, 0.6);
      const recommendations = this.generateLivestockRecommendations(results, animalType);
      
      tensor.dispose();
      predictions.dispose();

      return {
        predictions: results,
        confidence: Math.max(...results.map(r => r.confidence)),
        isOffline: true,
        modelVersion: '1.3.0',
        timestamp: Date.now(),
        recommendations
      };
    } catch (error) {
      console.error('Livestock diagnosis failed:', error);
      throw error;
    }
  }

  async analyzeSoilOffline(imageData: ImageData): Promise<DiagnosisResult> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    const model = this.models.get('soil_analysis_v1');
    const labels = this.labels.get('soil_analysis_v1');
    
    if (!model || !labels) {
      throw new Error('Soil analysis model not available offline');
    }

    try {
      const tensor = await this.preprocessImage(imageData, [224, 224, 3]);
      const predictions = await model.predict(tensor) as tf.Tensor;
      const scores = await predictions.data();
      
      const results = this.processResults(Array.from(scores), labels, 0.65);
      const recommendations = this.generateSoilRecommendations(results);
      
      tensor.dispose();
      predictions.dispose();

      return {
        predictions: results,
        confidence: Math.max(...results.map(r => r.confidence)),
        isOffline: true,
        modelVersion: '1.0.0',
        timestamp: Date.now(),
        recommendations
      };
    } catch (error) {
      console.error('Soil analysis failed:', error);
      throw error;
    }
  }

  async detectPestsOffline(imageData: ImageData): Promise<DiagnosisResult> {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    const model = this.models.get('pest_detection_v1');
    const labels = this.labels.get('pest_detection_v1');
    
    if (!model || !labels) {
      throw new Error('Pest detection model not available offline');
    }

    try {
      const tensor = await this.preprocessImage(imageData, [224, 224, 3]);
      const predictions = await model.predict(tensor) as tf.Tensor;
      const scores = await predictions.data();
      
      const results = this.processResults(Array.from(scores), labels, 0.75);
      const recommendations = this.generatePestRecommendations(results);
      
      tensor.dispose();
      predictions.dispose();

      return {
        predictions: results,
        confidence: Math.max(...results.map(r => r.confidence)),
        isOffline: true,
        modelVersion: '1.2.0',
        timestamp: Date.now(),
        recommendations
      };
    } catch (error) {
      console.error('Pest detection failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageData: ImageData, inputShape: number[]): Promise<tf.Tensor> {
    const tensor = tf.browser.fromPixels(imageData)
      .resizeNearestNeighbor([inputShape[0], inputShape[1]])
      .expandDims(0)
      .div(255.0);
    
    return tensor;
  }

  private processResults(scores: number[], labels: string[], threshold: number): Prediction[] {
    const results: Prediction[] = [];
    
    for (let i = 0; i < scores.length && i < labels.length; i++) {
      if (scores[i] >= threshold) {
        results.push({
          label: labels[i],
          confidence: scores[i],
          description: this.getDescription(labels[i]),
          treatment: this.getTreatment(labels[i]),
          severity: this.getSeverity(labels[i], scores[i])
        });
      }
    }
    
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  private getDescription(label: string): string {
    const descriptions: Record<string, string> = {
      'Bacterial Blight': 'A bacterial disease causing water-soaked lesions on leaves',
      'Brown Spot': 'Fungal disease causing brown spots with yellow halos',
      'Leaf Smut': 'Fungal infection causing black powdery masses on leaves',
      'Respiratory Infection': 'Bacterial or viral infection affecting breathing',
      'Foot Rot': 'Bacterial infection causing lameness and swelling',
      'Mastitis': 'Inflammation of mammary glands, often bacterial',
      'Nutrient Deficient': 'Soil lacks essential nutrients for plant growth',
      'High Acidity': 'Soil pH is too low for optimal plant growth',
      'Aphids': 'Small insects that suck plant juices',
      'Caterpillars': 'Larvae that feed on leaves and stems'
    };
    
    return descriptions[label] || `${label} detected`;
  }

  private getTreatment(label: string): string {
    const treatments: Record<string, string> = {
      'Bacterial Blight': 'Apply copper-based bactericide, improve drainage',
      'Brown Spot': 'Use fungicide spray, remove affected leaves',
      'Leaf Smut': 'Apply systemic fungicide, practice crop rotation',
      'Respiratory Infection': 'Isolate animal, provide antibiotics if bacterial',
      'Foot Rot': 'Clean and disinfect hooves, apply topical treatment',
      'Mastitis': 'Milk out affected quarters, apply antibiotic treatment',
      'Nutrient Deficient': 'Apply balanced fertilizer, conduct soil test',
      'High Acidity': 'Apply lime to raise pH, add organic matter',
      'Aphids': 'Use insecticidal soap or neem oil spray',
      'Caterpillars': 'Apply Bt spray or pick off manually'
    };
    
    return treatments[label] || 'Consult agricultural expert for treatment';
  }

  private getSeverity(label: string, confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (label === 'Healthy' || label === 'No Pests' || label === 'Fertile Soil') {
      return 'low';
    }
    
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  private generatePlantRecommendations(results: Prediction[], cropType?: string): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0 || results[0].label === 'Healthy') {
      recommendations.push('Plant appears healthy. Continue regular care.');
      recommendations.push('Monitor for early signs of disease or pests.');
      return recommendations;
    }
    
    const topResult = results[0];
    recommendations.push(`Primary concern: ${topResult.label}`);
    
    if (topResult.treatment) {
      recommendations.push(`Treatment: ${topResult.treatment}`);
    }
    
    if (topResult.severity === 'critical' || topResult.severity === 'high') {
      recommendations.push('Immediate action required to prevent spread.');
      recommendations.push('Consider consulting a plant pathologist.');
    }
    
    recommendations.push('Improve plant hygiene and air circulation.');
    recommendations.push('Monitor other plants for similar symptoms.');
    
    return recommendations;
  }

  private generateLivestockRecommendations(results: Prediction[], animalType?: string): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0 || results[0].label === 'Healthy') {
      recommendations.push('Animal appears healthy. Maintain regular care.');
      recommendations.push('Continue vaccination schedule and health monitoring.');
      return recommendations;
    }
    
    const topResult = results[0];
    recommendations.push(`Primary concern: ${topResult.label}`);
    
    if (topResult.treatment) {
      recommendations.push(`Treatment: ${topResult.treatment}`);
    }
    
    if (topResult.severity === 'critical' || topResult.severity === 'high') {
      recommendations.push('Isolate animal immediately to prevent spread.');
      recommendations.push('Contact veterinarian urgently.');
    }
    
    recommendations.push('Monitor animal closely for changes.');
    recommendations.push('Ensure proper nutrition and clean environment.');
    
    return recommendations;
  }

  private generateSoilRecommendations(results: Prediction[]): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0 || results[0].label === 'Fertile Soil') {
      recommendations.push('Soil appears fertile and healthy.');
      recommendations.push('Maintain current soil management practices.');
      return recommendations;
    }
    
    const topResult = results[0];
    recommendations.push(`Primary issue: ${topResult.label}`);
    
    if (topResult.treatment) {
      recommendations.push(`Solution: ${topResult.treatment}`);
    }
    
    recommendations.push('Consider professional soil testing for detailed analysis.');
    recommendations.push('Implement appropriate soil improvement measures.');
    
    return recommendations;
  }

  private generatePestRecommendations(results: Prediction[]): string[] {
    const recommendations: string[] = [];
    
    if (results.length === 0 || results[0].label === 'No Pests') {
      recommendations.push('No pests detected. Continue monitoring.');
      recommendations.push('Maintain integrated pest management practices.');
      return recommendations;
    }
    
    const topResult = results[0];
    recommendations.push(`Pest identified: ${topResult.label}`);
    
    if (topResult.treatment) {
      recommendations.push(`Control method: ${topResult.treatment}`);
    }
    
    if (topResult.severity === 'critical' || topResult.severity === 'high') {
      recommendations.push('High pest pressure detected. Act immediately.');
      recommendations.push('Consider biological control methods.');
    }
    
    recommendations.push('Monitor pest population regularly.');
    recommendations.push('Use integrated pest management approach.');
    
    return recommendations;
  }

  private async getCachedModel(modelName: string): Promise<tf.LayersModel | null> {
    try {
      const cachedData = await offlineStorageService.getOfflineData(`model_${modelName}`);
      if (cachedData) {
        return null; // Placeholder
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async cacheModel(modelName: string, model: tf.LayersModel): Promise<void> {
    try {
      await offlineStorageService.storeOfflineData({
        id: `model_${modelName}`,
        type: 'ai_model',
        data: {
          name: modelName,
          cached_at: Date.now(),
        }
      });
    } catch (error) {
      console.error('Failed to cache model:', error);
    }
  }

  getAvailableModels(): AIModel[] {
    return this.availableModels;
  }

  isModelAvailable(modelName: string): boolean {
    return this.models.has(modelName);
  }

  async updateModels(): Promise<void> {
    console.log('Checking for model updates...');
  }
}

export const enhancedOfflineAIService = new EnhancedOfflineAIService();
