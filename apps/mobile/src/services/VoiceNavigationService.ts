import { Audio } from 'expo-av';
import { speechToTextService } from './SpeechToTextService';
import { offlineStorageService } from './OfflineStorageService';

interface VoiceCommand {
  command: string;
  action: string;
  parameters?: Record<string, any>;
}

interface VoiceNavigationConfig {
  language: string;
  commands: VoiceCommand[];
  sensitivity: number;
}

class VoiceNavigationService {
  private isListening = false;
  private recording: Audio.Recording | null = null;
  private config: VoiceNavigationConfig;

  constructor() {
    this.config = {
      language: 'en',
      commands: [
        { command: 'diagnose crop', action: 'navigate', parameters: { screen: 'diagnostic', type: 'crop' } },
        { command: 'check weather', action: 'navigate', parameters: { screen: 'weather' } },
        { command: 'open marketplace', action: 'navigate', parameters: { screen: 'marketplace' } },
        { command: 'livestock health', action: 'navigate', parameters: { screen: 'diagnostic', type: 'livestock' } },
        { command: 'farm records', action: 'navigate', parameters: { screen: 'records' } },
        { command: 'community forum', action: 'navigate', parameters: { screen: 'community' } },
        { command: 'learning modules', action: 'navigate', parameters: { screen: 'learning' } },
        { command: 'take photo', action: 'camera', parameters: { mode: 'photo' } },
        { command: 'record symptoms', action: 'voice_input', parameters: { type: 'symptoms' } },
        { command: 'help', action: 'show_help' },
        { command: 'repeat', action: 'repeat_last' }
      ],
      sensitivity: 0.7
    };
  }

  async startListening(): Promise<void> {
    try {
      if (this.isListening) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isListening = true;

      setTimeout(() => {
        if (this.isListening) {
          this.stopListening();
        }
      }, 5000);

    } catch (error) {
      console.error('Failed to start voice navigation:', error);
      throw error;
    }
  }

  async stopListening(): Promise<VoiceCommand | null> {
    try {
      if (!this.isListening || !this.recording) return null;

      this.isListening = false;
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      if (uri) {
        const transcription = await speechToTextService.transcribeAudio(uri);
        if (transcription.text) {
          return this.processVoiceCommand(transcription.text);
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to stop voice navigation:', error);
      return null;
    }
  }

  private processVoiceCommand(text: string): VoiceCommand | null {
    const normalizedText = text.toLowerCase().trim();
    
    for (const command of this.config.commands) {
      if (this.matchesCommand(normalizedText, command.command)) {
        return command;
      }
    }

    return null;
  }

  private matchesCommand(text: string, command: string): boolean {
    const commandWords = command.toLowerCase().split(' ');
    const textWords = text.split(' ');

    let matchCount = 0;
    for (const commandWord of commandWords) {
      if (textWords.some(textWord => 
        textWord.includes(commandWord) || commandWord.includes(textWord)
      )) {
        matchCount++;
      }
    }

    return (matchCount / commandWords.length) >= this.config.sensitivity;
  }

  async setLanguage(language: string): Promise<void> {
    this.config.language = language;
    await offlineStorageService.storeOfflineData({
      id: 'voice_navigation_config',
      type: 'notification',
      data: this.config
    });
  }

  async addCustomCommand(command: VoiceCommand): Promise<void> {
    this.config.commands.push(command);
    await offlineStorageService.storeOfflineData({
      id: 'voice_navigation_config',
      type: 'notification',
      data: this.config
    });
  }

  getAvailableCommands(): string[] {
    return this.config.commands.map(cmd => cmd.command);
  }

  async speakResponse(text: string): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      console.log('Speaking:', text);
    } catch (error) {
      console.error('Failed to speak response:', error);
    }
  }
}

export const voiceNavigationService = new VoiceNavigationService();
