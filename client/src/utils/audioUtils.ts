// Audio utility functions for notification sounds and TTS

export const playNotificationSound = () => {
  // Create a simple notification sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple pleasant notification tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency for a pleasant notification sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    // Set volume envelope
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