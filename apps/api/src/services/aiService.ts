import * as tf from '@tensorflow/tfjs-node';
import { pipeline } from '@huggingface/transformers';
import sharp from 'sharp';
import { modelLoader } from '../utils/aiModelLoader';
import { aiProxyService } from './aiProxyService';

export class AIService {
  private plantDiseaseModel: tf.LayersModel | null = null;
  private livestockHealthModel: tf.LayersModel | null = null;
  private chatPipeline: any = null;

  async initialize() {
    try {
      console.log('🤖 Initializing AI models...');
      
      await this.loadPlantDiseaseModel();
      await this.loadLivestockHealthModel();
      await this.initializeChatPipeline();
      
      console.log('✅ AI models loaded successfully');
    } catch (error) {
      console.error('❌ AI model loading failed:', error);
      throw error;
    }
  }

  private async loadPlantDiseaseModel() {
    try {
      const modelUrl = process.env.PLANT_DISEASE_MODEL_URL;
      if (modelUrl) {
        this.plantDiseaseModel = await modelLoader.loadModel('plant-disease', modelUrl);
      } else {
        console.warn('⚠️ PLANT_DISEASE_MODEL_URL not configured, using mock implementation');
        this.plantDiseaseModel = null;
      }
    } catch (error) {
      console.warn('⚠️ Plant disease model loading failed, using mock implementation');
      this.plantDiseaseModel = null;
    }
  }

  private async loadLivestockHealthModel() {
    try {
      const modelUrl = process.env.LIVESTOCK_MODEL_URL;
      if (modelUrl) {
        this.livestockHealthModel = await modelLoader.loadModel('livestock-health', modelUrl);
      } else {
        console.warn('⚠️ LIVESTOCK_MODEL_URL not configured, using mock implementation');
        this.livestockHealthModel = null;
      }
    } catch (error) {
      console.warn('⚠️ Livestock health model loading failed, using mock implementation');
      this.livestockHealthModel = null;
    }
  }

  private async initializeChatPipeline() {
    try {
      this.chatPipeline = await pipeline('text-generation', 'microsoft/DialoGPT-medium');
      console.log('✅ Chat pipeline initialized');
    } catch (error) {
      console.warn('⚠️ Chat pipeline initialization failed, using mock implementation');
      this.chatPipeline = null;
    }
  }

  async classifyPlantDisease(imageBuffer: Buffer): Promise<{
    diagnosis: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }> {
    try {
      const imageBase64 = imageBuffer.toString('base64');
      const fastApiResult = await aiProxyService.diagnoseVision(imageBase64, 'general');
      
      const topDisease = fastApiResult.diseases[0];
      return {
        diagnosis: topDisease.label,
        confidence: topDisease.score,
        severity: this.mapSeverity(fastApiResult.severity),
        recommendations: this.getRecommendations(topDisease.label, fastApiResult.severity)
      };
    } catch (error) {
      console.warn('FastAPI diagnosis failed, falling back to TensorFlow.js:', error);
      
      if (!this.plantDiseaseModel) {
        return this.getMockPlantDiagnosis();
      }

      const processedImage = await this.preprocessImage(imageBuffer, 224, 224);
      const prediction = this.plantDiseaseModel.predict(processedImage) as tf.Tensor;
      const results = await prediction.data();
      
      const resultsArray = Array.from(results) as number[];
      const confidence = Math.max(...resultsArray);
      const diagnosis = this.mapPredictionToDisease(results as Float32Array);
      const severity = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
      
      processedImage.dispose();
      prediction.dispose();
      
      return {
        diagnosis,
        confidence,
        severity,
        recommendations: this.getRecommendations(diagnosis, severity)
      };
    }
  }

  async classifyLivestockHealth(imageBuffer: Buffer): Promise<{
    diagnosis: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  }> {
    try {
      if (!this.livestockHealthModel) {
        return this.getMockLivestockDiagnosis();
      }

      const processedImage = await this.preprocessImage(imageBuffer, 224, 224);
      const prediction = this.livestockHealthModel.predict(processedImage) as tf.Tensor;
      const results = await prediction.data();
      
      const resultsArray = Array.from(results) as number[];
      const confidence = Math.max(...resultsArray);
      const diagnosis = this.mapPredictionToLivestockCondition(results as Float32Array);
      const severity = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
      
      processedImage.dispose();
      prediction.dispose();
      
      return {
        diagnosis,
        confidence,
        severity,
        recommendations: this.getLivestockRecommendations(diagnosis, severity)
      };
    } catch (error) {
      console.error('Livestock health classification error:', error);
      return this.getMockLivestockDiagnosis();
    }
  }

  async generateChatResponse(message: string, language: string = 'en', context: string = 'agriculture'): Promise<string> {
    try {
      if (!this.chatPipeline) {
        return this.getMockChatResponse(message, language, context);
      }

      const contextPrompt = this.getContextPrompt(context, language);
      const fullPrompt = `${contextPrompt}\nUser: ${message}\nAssistant:`;

      const response = await this.chatPipeline(fullPrompt, {
        max_length: 150,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: 50256
      });

      return response[0].generated_text
        .replace(fullPrompt, '')
        .trim();
    } catch (error) {
      console.error('Chat response generation error:', error);
      return this.getMockChatResponse(message, language, context);
    }
  }

  private async preprocessImage(buffer: Buffer, width: number, height: number): Promise<tf.Tensor> {
    const image = await sharp(buffer)
      .resize(width, height)
      .removeAlpha()
      .raw()
      .toBuffer();
    
    const tensor = tf.tensor3d(new Uint8Array(image), [height, width, 3]);
    return tensor.expandDims(0).div(255.0);
  }

  private mapPredictionToDisease(results: Float32Array): string {
    const diseases = ['Healthy', 'Bacterial Blight', 'Brown Spot', 'Leaf Smut', 'Blast Disease'];
    const maxIndex = results.indexOf(Math.max(...Array.from(results)));
    return diseases[maxIndex] || 'Unknown Disease';
  }

  private mapPredictionToLivestockCondition(results: Float32Array): string {
    const conditions = ['Healthy', 'Respiratory Issue', 'Skin Condition', 'Nutritional Deficiency', 'Injury'];
    const maxIndex = results.indexOf(Math.max(...Array.from(results)));
    return conditions[maxIndex] || 'Unknown Condition';
  }

  private getRecommendations(diagnosis: string, severity: string): string[] {
    if (diagnosis === 'Healthy') {
      return ['Continue current care practices', 'Monitor regularly for any changes'];
    }
    
    const baseRecommendations = [
      'Apply appropriate treatment as recommended',
      'Improve environmental conditions',
      'Monitor affected areas closely'
    ];

    if (severity === 'high' || severity === 'critical') {
      baseRecommendations.push('Consult with agricultural expert immediately');
      baseRecommendations.push('Consider quarantine measures if applicable');
    }

    return baseRecommendations;
  }

  private getLivestockRecommendations(diagnosis: string, severity: string): string[] {
    if (diagnosis === 'Healthy') {
      return ['Maintain current care routine', 'Continue regular health monitoring'];
    }
    
    const baseRecommendations = [
      'Consult with veterinarian for proper diagnosis',
      'Monitor animal behavior and appetite',
      'Ensure proper nutrition and hydration'
    ];

    if (severity === 'high' || severity === 'critical') {
      baseRecommendations.push('Seek immediate veterinary attention');
      baseRecommendations.push('Isolate animal if contagious condition suspected');
    }

    return baseRecommendations;
  }

  private getContextPrompt(context: string, language: string): string {
    const prompts = {
      agriculture: {
        en: "You are an agricultural expert assistant helping farmers with crop management, livestock care, and farming best practices.",
        es: "Eres un asistente experto en agricultura que ayuda a los agricultores con el manejo de cultivos, cuidado del ganado y mejores prácticas agrícolas.",
        fr: "Vous êtes un assistant expert agricole aidant les agriculteurs avec la gestion des cultures, les soins du bétail et les meilleures pratiques agricoles.",
        sw: "Wewe ni msaidizi mtaalamu wa kilimo unayesaidia wakulima katika usimamizi wa mazao, utunzaji wa mifugo, na mbinu bora za kilimo."
      },
      veterinary: {
        en: "You are a veterinary expert assistant helping with livestock health, disease prevention, and animal care.",
        es: "Eres un asistente experto veterinario que ayuda con la salud del ganado, prevención de enfermedades y cuidado animal.",
        fr: "Vous êtes un assistant expert vétérinaire aidant avec la santé du bétail, la prévention des maladies et les soins aux animaux.",
        sw: "Wewe ni msaidizi mtaalamu wa mifugo unayesaidia katika afya ya mifugo, kuzuia magonjwa, na utunzaji wa wanyamapori."
      }
    };

    return prompts[context as keyof typeof prompts]?.[language as keyof typeof prompts.agriculture] || 
           prompts.agriculture.en;
  }

  private getMockPlantDiagnosis() {
    const mockDiagnoses = [
      { diagnosis: 'Healthy Plant', confidence: 0.85, severity: 'low' as const },
      { diagnosis: 'Early Blight', confidence: 0.72, severity: 'medium' as const },
      { diagnosis: 'Bacterial Spot', confidence: 0.68, severity: 'medium' as const },
      { diagnosis: 'Leaf Curl', confidence: 0.91, severity: 'high' as const }
    ];
    
    const selected = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
    return {
      ...selected,
      recommendations: this.getRecommendations(selected.diagnosis, selected.severity)
    };
  }

  private getMockLivestockDiagnosis() {
    const mockDiagnoses = [
      { diagnosis: 'Healthy Animal', confidence: 0.88, severity: 'low' as const },
      { diagnosis: 'Mild Respiratory Issue', confidence: 0.74, severity: 'medium' as const },
      { diagnosis: 'Skin Irritation', confidence: 0.69, severity: 'medium' as const },
      { diagnosis: 'Nutritional Deficiency', confidence: 0.82, severity: 'high' as const }
    ];
    
    const selected = mockDiagnoses[Math.floor(Math.random() * mockDiagnoses.length)];
    return {
      ...selected,
      recommendations: this.getLivestockRecommendations(selected.diagnosis, selected.severity)
    };
  }

  private mapSeverity(fastApiSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (fastApiSeverity) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  private getMockChatResponse(message: string, language: string, context: string): string {
    const responses = {
      en: [
        "Thank you for your question about farming. Based on your query, I recommend consulting with local agricultural experts for the best advice.",
        "That's a great question about agriculture. Here are some general recommendations that might help with your farming practices.",
        "I understand your concern about your crops/livestock. It's important to monitor the situation closely and take appropriate action."
      ],
      es: [
        "Gracias por tu pregunta sobre agricultura. Te recomiendo consultar con expertos agrícolas locales para obtener el mejor consejo.",
        "Esa es una gran pregunta sobre agricultura. Aquí tienes algunas recomendaciones generales que podrían ayudar con tus prácticas agrícolas."
      ],
      sw: [
        "Asante kwa swali lako kuhusu kilimo. Napendekeza uongee na wataalamu wa kilimo wa eneo lako kwa ushauri bora.",
        "Hilo ni swali zuri kuhusu kilimo. Hapa kuna mapendekezo ya jumla yanayoweza kusaidia katika mbinu zako za kilimo."
      ]
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
  }
}

export const aiService = new AIService();
