// Audio utility functions for notification sounds and TTS

export const playNotificationSound = () => {
  // Create a longer, more noticeable notification sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant multi-tone notification sequence
    const createTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
      oscillator.type = 'sine';
      
      // Smooth volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    
    // Create a pleasant 3-tone notification sequence (longer duration)
    createTone(800, 0, 0.4, 0.25);      // First tone: 800Hz for 0.4s
    createTone(1000, 0.5, 0.4, 0.25);   // Second tone: 1000Hz after 0.5s
    createTone(1200, 1.0, 0.5, 0.25);   // Third tone: 1200Hz after 1s
    
    console.log('Playing extended notification sound (2 seconds)');
  } catch (error) {
    console.log('Audio notification not available');
  }
};

// Create a shorter quick notification sound for less intrusive alerts
export const playQuickNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Quick pleasant chime
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio notification not available');
  }
};

// Create an attention-grabbing alert sound for important notifications
export const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBeep = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
      oscillator.type = 'square'; // Square wave for more attention-grabbing sound
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };
    
    // Create attention-grabbing alert pattern
    createBeep(1000, 0, 0.2);       // Beep 1
    createBeep(1000, 0.3, 0.2);     // Beep 2
    createBeep(1200, 0.6, 0.3);     // Higher pitch final beep
    
    console.log('Playing alert sound');
  } catch (error) {
    console.log('Alert sound not available');
  }
};

export const stripHtmlTags = (html: string): string => {
  // Remove HTML tags for TTS
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
};

export const speakText = async (text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
  if (!text || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const { rate = 0.9, pitch = 1, volume = 0.8 } = options;
  
  const utterance = new SpeechSynthesisUtterance(stripHtmlTags(text));
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
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

  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => reject();
    window.speechSynthesis.speak(utterance);
  });
};