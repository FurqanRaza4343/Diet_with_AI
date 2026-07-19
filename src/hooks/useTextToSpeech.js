import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = (language = 'en') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  const langMap = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'hi': 'hi-IN',
    'ur': 'ur-PK',
    'ar': 'ar-SA',
    'zh': 'zh-CN',
    'ja': 'ja-JP'
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        const targetLang = langMap[language] || 'en-US';
        const match = availableVoices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (match) {
          setSelectedVoice(match);
        } else if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0]);
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [language]);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported');
      return;
    }

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [selectedVoice, isSpeaking]);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const isSupported = 'speechSynthesis' in window;

  return {
    isSpeaking,
    speak,
    cancel,
    isSupported,
    selectedVoice,
    voices,
  };
};