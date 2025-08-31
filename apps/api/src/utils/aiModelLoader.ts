import * as tf from '@tensorflow/tfjs-node';

export class ModelLoader {
  private static instance: ModelLoader;
  private loadedModels: Map<string, tf.LayersModel> = new Map();

  private constructor() {}

  static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  async loadModel(modelId: string, modelUrl: string): Promise<tf.LayersModel> {
    if (this.loadedModels.has(modelId)) {
      return this.loadedModels.get(modelId)!;
    }

    try {
      console.log(`Loading AI model: ${modelId} from ${modelUrl}`);
      const model = await tf.loadLayersModel(modelUrl);
      this.loadedModels.set(modelId, model);
      console.log(`✅ Model ${modelId} loaded successfully`);
      return model;
    } catch (error) {
      console.error(`❌ Failed to load model ${modelId}:`, error);
      throw error;
    }
  }

  getModel(modelId: string): tf.LayersModel | null {
    return this.loadedModels.get(modelId) || null;
  }

  unloadModel(modelId: string): void {
    const model = this.loadedModels.get(modelId);
    if (model) {
      model.dispose();
      this.loadedModels.delete(modelId);
      console.log(`Model ${modelId} unloaded`);
    }
  }

  getLoadedModels(): string[] {
    return Array.from(this.loadedModels.keys());
  }
}

export const modelLoader = ModelLoader.getInstance();
