import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNutritionAnalysis } from '../../hooks/useNutritionAnalysis';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import FoodInput from '../../components/nutrition/FoodInput';
import ImageUpload from '../../components/nutrition/ImageUpload';
import AnalysisResult from '../../components/nutrition/AnalysisResult';
import LanguageSelector from '../../components/nutrition/LanguageSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaHome } from 'react-icons/fa';

const NutritionPage = () => {
  const [language, setLanguage] = useState('en');
  const { loading, result, analyzeFood, analyzeImage, clearResult } = useNutritionAnalysis();
  const { isRecording, transcript, isSupported, startRecording, stopRecording, setTranscript } = useVoiceInput(language);
  const { isSpeaking, speak, cancel, isSupported: ttsSupported } = useTextToSpeech(language);

  const handleAnalyze = (text) => { analyzeFood(text, language); };
  const handleImageUpload = (file) => { analyzeImage(file, language); };
  const handleSpeak = () => { if (result?.voiceResponse) speak(result.voiceResponse); };
  const handleClear = () => { clearResult(); setTranscript(''); if (isSpeaking) cancel(); };

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1">
            <FaHome /> Home
          </Link>
          <Link to="/dashboard" className="text-sm text-on-surface-variant hover:text-on-surface">
            Dashboard
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface">AI Nutrition Assistant</h1>
          <p className="text-on-surface-variant mt-1">Speak, type, or upload a photo - AI will analyze your food</p>
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1.5 rounded-full font-medium">🎤 Voice Input</span>
            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-full font-medium">📸 Image Upload</span>
            <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-full font-medium">🌐 9 Languages</span>
            <span className="bg-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-full font-medium">🔊 Text-to-Speech</span>
          </div>
        </div>

        <LanguageSelector language={language} onLanguageChange={setLanguage} />

        <div className="grid gap-6 mt-6">
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

export default NutritionPage;
