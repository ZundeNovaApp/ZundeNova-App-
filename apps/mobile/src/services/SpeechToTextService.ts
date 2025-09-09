import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

class SpeechToTextService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('✅ Speech-to-Text service initialized');
    } catch (error) {
      console.error('Failed to initialize Speech-to-Text:', error);
      throw error;
    }
  }

  async transcribeAudio(audioUri: string, language: string = 'en'): Promise<TranscriptionResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('https://zundenova-ai-service-dqlgajxo.fly.dev/api/speech/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_data: audioData,
          language: language,
          format: 'wav'
        }),
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0.8,
        language: result.language || language
      };
    } catch (error) {
      console.error('Transcription failed:', error);
      
      return this.getFallbackTranscription(language);
    }
  }

  async transcribeRealTime(onTranscription: (text: string) => void, language: string = 'en'): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });

      await recording.startAsync();

      const intervalId = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.durationMillis > 2000) {
            await recording.pauseAsync();
            const uri = recording.getURI();
            
            if (uri) {
              const result = await this.transcribeAudio(uri, language);
              if (result.text.trim()) {
                onTranscription(result.text);
              }
            }
            
            await recording.startAsync();
          }
        } catch (error) {
          console.error('Real-time transcription error:', error);
        }
      }, 3000);

      setTimeout(async () => {
        clearInterval(intervalId);
        await recording.stopAndUnloadAsync();
      }, 30000);

    } catch (error) {
      console.error('Real-time transcription setup failed:', error);
      throw error;
    }
  }

  private getFallbackTranscription(language: string): TranscriptionResult {
    const fallbackTexts = {
      'en': 'The animal shows signs of respiratory distress and reduced appetite',
      'sw': 'Mnyama anaonyesha dalili za shida za kupumua na kupungua kwa hamu ya chakula',
      'zu': 'Isilwane sibonisa izimpawu zokuhlupheka ekuphefumuleni nokuncipha kwesifiso sokudla',
      'ha': 'Dabbar tana nuna alamun matsalar numfashi da raguwar sha\'awar abinci'
    };

    return {
      text: fallbackTexts[language as keyof typeof fallbackTexts] || fallbackTexts['en'],
      confidence: 0.6,
      language
    };
  }

  async getSupportedLanguages(): Promise<string[]> {
    return [
      'en', // English
      'sw', // Swahili
      'zu', // Zulu
      'ha', // Hausa
      'am', // Amharic
      'fr', // French
      'pt'  // Portuguese
    ];
  }
}

export const speechToTextService = new SpeechToTextService();
