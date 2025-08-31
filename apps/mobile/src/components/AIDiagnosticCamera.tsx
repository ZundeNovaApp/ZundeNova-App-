import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

interface AIDiagnosticCameraProps {
  onDiagnosisComplete: (result: any) => void;
  diagnosticType: 'crop' | 'livestock' | 'soil';
}

export default function AIDiagnosticCamera({ 
  onDiagnosisComplete, 
  diagnosticType 
}: AIDiagnosticCameraProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      await tf.ready();
      
      try {
        const modelUrl = getModelUrl(diagnosticType);
        const loadedModel = await tf.loadLayersModel(modelUrl);
        setModel(loadedModel);
        console.log('✅ Edge AI model loaded');
      } catch (error) {
        console.error('❌ Failed to load edge AI model:', error);
      }
    })();
  }, [diagnosticType]);

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      setIsProcessing(true);
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });

        if (model && photo.base64) {
          const edgeResult = await processWithEdgeAI(photo.base64, model);
          
          if (edgeResult.confidence > 0.7) {
            onDiagnosisComplete({
              ...edgeResult,
              source: 'edge',
              imageUri: photo.uri
            });
          } else {
            await sendToCloudAPI(photo);
          }
        } else {
          await sendToCloudAPI(photo);
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to take picture');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processWithEdgeAI = async (base64Image: string, model: tf.LayersModel) => {
    try {
      const imageData = tf.browser.fromPixels(
        await loadImageFromBase64(base64Image)
      );
      
      const resized = tf.image.resizeBilinear(imageData, [224, 224]);
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);
      
      const prediction = model.predict(batched) as tf.Tensor;
      const results = await prediction.data();
      
      imageData.dispose();
      resized.dispose();
      normalized.dispose();
      batched.dispose();
      prediction.dispose();
      
      return {
        diagnosis: mapPredictionToDisease(results),
        confidence: Math.max(...Array.from(results) as number[]),
        severity: 'medium' as const,
        recommendations: ['Edge AI analysis completed']
      };
    } catch (error) {
      console.error('Edge AI processing error:', error);
      return {
        diagnosis: 'Analysis failed',
        confidence: 0,
        severity: 'low' as const,
        recommendations: ['Please try again']
      };
    }
  };

  const sendToCloudAPI = async (photo: any) => {
    onDiagnosisComplete({
      diagnosis: 'Cloud analysis pending',
      confidence: 0.5,
      severity: 'medium',
      recommendations: ['Analysis in progress'],
      source: 'cloud',
      imageUri: photo.uri
    });
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isProcessing && styles.buttonDisabled]}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Text style={styles.text}>
              {isProcessing ? 'Processing...' : 'Diagnose'}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

function getModelUrl(type: string): string {
  const models = {
    crop: 'https://example.com/crop-disease-model.json',
    livestock: 'https://example.com/livestock-health-model.json',
    soil: 'https://example.com/soil-analysis-model.json'
  };
  return models[type as keyof typeof models] || models.crop;
}

function loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}

function mapPredictionToDisease(results: Float32Array): string {
  const diseases = ['Healthy', 'Bacterial Blight', 'Brown Spot', 'Leaf Smut'];
  const maxIndex = results.indexOf(Math.max(...Array.from(results)));
  return diseases[maxIndex] || 'Unknown';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.3,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#228B22',
    padding: 15,
    borderRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});
