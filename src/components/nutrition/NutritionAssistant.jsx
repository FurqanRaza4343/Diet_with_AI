import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNutritionAnalysis } from '../../hooks/useNutritionAnalysis';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import FoodInput from './FoodInput';
import ImageUpload from './ImageUpload';
import AnalysisResult from './AnalysisResult';
import LanguageSelector from './LanguageSelector';
import LoadingSpinner from '../common/LoadingSpinner';
import { Bot, Mic, Camera, Globe, Volume2 } from 'lucide-react';

const NutritionAssistant = () => {
  const [language, setLanguage] = useState('en');
  const { loading, result, analyzeFood, analyzeImage, clearResult } = useNutritionAnalysis();
  const { isRecording, transcript, isSupported, startRecording, stopRecording, setTranscript } = useVoiceInput(language);
  const { isSpeaking, speak, cancel, isSupported: ttsSupported } = useTextToSpeech(language);

  const handleAnalyze = (text) => analyzeFood(text, language);
  const handleImageUpload = (file) => analyzeImage(file, language);
  const handleSpeak = () => { if (result?.voiceResponse) speak(result.voiceResponse); };
  const handleClear = () => { clearResult(); setTranscript(''); if (isSpeaking) cancel(); };

  const features = [
    { icon: Mic, label: 'Voice Input', color: 'bg-primary-100 text-primary-700' },
    { icon: Camera, label: 'Image Upload', color: 'bg-purple-100 text-purple-700' },
    { icon: Globe, label: '9 Languages', color: 'bg-amber-100 text-amber-700' },
    { icon: Volume2, label: 'Text-to-Speech', color: 'bg-rose-100 text-rose-700' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 text-sm font-medium text-primary-700 mb-4">
          <Bot size={16} />
          AI Nutritionist
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-on-surface">AI Nutrition Assistant</h1>
        <p className="text-on-surface-variant mt-1">Speak, type, or upload a photo - AI will analyze your food</p>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {features.map((f, i) => (
            <span key={i} className={`inline-flex items-center gap-1.5 ${f.color} text-xs px-3 py-1.5 rounded-full font-medium`}>
              <f.icon size={14} /> {f.label}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        <LanguageSelector language={language} onLanguageChange={setLanguage} />
        <div className="grid gap-5 mt-6">
          <FoodInput
            onAnalyze={handleAnalyze}
            onVoiceStart={startRecording}
            onVoiceStop={stopRecording}
            isRecording={isRecording}
            transcript={transcript}
            setTranscript={setTranscript}
            isVoiceSupported={isSupported}
            isLoading={loading}
          />
          <ImageUpload onImageUpload={handleImageUpload} isLoading={loading} />
          {loading && <LoadingSpinner />}
          {result && (
            <AnalysisResult
              result={result}
              onSpeak={handleSpeak}
              isSpeaking={isSpeaking}
              isTtsSupported={ttsSupported}
              onClear={handleClear}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionAssistant;
