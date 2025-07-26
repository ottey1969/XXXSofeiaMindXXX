import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioControlsProps {
  onVoiceInput?: (transcript: string) => void;
  enabled?: boolean;
}

export default function AudioControls({ onVoiceInput, enabled = true }: AudioControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, [onVoiceInput, toast]);

  const speakText = async (text: string) => {
    if (!audioEnabled || !text || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Neural') || 
      voice.name.includes('Enhanced') ||
      voice.name.includes('Premium')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognition) {
      toast({
        title: "Voice Input Unavailable",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isPlaying) {
      stopSpeaking();
    }
  };

  // Expose speak function globally for use by other components
  useEffect(() => {
    (window as any).sofeiaSpeak = speakText;
    return () => {
      delete (window as any).sofeiaSpeak;
    };
  }, [audioEnabled]);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Audio Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleAudio}
        title={audioEnabled ? "Disable audio" : "Enable audio"}
      >
        {audioEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </Button>

      {/* Stop Speaking */}
      {isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={stopSpeaking}
          title="Stop speaking"
          className="text-red-600"
        >
          <VolumeX className="w-4 h-4" />
        </Button>
      )}

      {/* Voice Input */}
      <Button
        variant="ghost"
        size="sm"
        onClick={isListening ? stopListening : startListening}
        title={isListening ? "Stop listening" : "Voice input"}
        className={isListening ? "text-red-600" : ""}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 animate-pulse" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}