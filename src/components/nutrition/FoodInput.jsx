import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaStop, FaRobot, FaEraser } from 'react-icons/fa';
import Card from '../common/Card';
import VoiceStatus from '../common/VoiceStatus';

const FoodInput = ({
  onAnalyze,
  onVoiceStart,
  onVoiceStop,
  isRecording,
  transcript,
  setTranscript,
  isVoiceSupported,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');

  const examples = [
    { label: '🥗 Salad', text: 'I ate a salad with grilled chicken and vegetables' },
    { label: '🍔 Burger', text: 'I had a cheeseburger with french fries' },
    { label: '🥣 Oatmeal', text: 'I ate oatmeal with berries and nuts for breakfast' },
    { label: '🍕 Pizza', text: 'I had a large pizza with extra cheese' },
    { label: '🍣 Sushi', text: 'I ate sushi with salmon and avocado' },
    { label: '🥑 Avocado Toast', text: 'I had avocado toast with eggs' },
  ];

  const handleSubmit = () => {
    const text = inputText.trim() || transcript.trim();
    if (text) {
      onAnalyze(text);
      setInputText('');
      setTranscript('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (text) => {
    setInputText(text);
    setTranscript('');
  };

  const handleClear = () => {
    setInputText('');
    setTranscript('');
  };

  const showVoiceStatus = isRecording || transcript || (isVoiceSupported && !isRecording);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-lg font-semibold">📝 Tell us what you ate</span>
        {isVoiceSupported && (
          <span className="bg-primary-400/20 text-primary-400 text-xs px-2 py-1 rounded-full">
            🎤 Voice Input
          </span>
        )}
        {!isVoiceSupported && (
          <span className="bg-warning/20 text-warning text-xs px-2 py-1 rounded-full">
            ⚠️ Voice not supported
          </span>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={inputText || transcript}
            onChange={(e) => {
              setInputText(e.target.value);
              setTranscript('');
            }}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? 'Listening...' : "Describe what you ate (e.g., 'I ate a large pizza')"}
            className="input min-h-[60px]"
            rows="2"
            disabled={isRecording}
          />
        </div>

        {isVoiceSupported && (
          <button
            onClick={isRecording ? onVoiceStop : onVoiceStart}
            className={`btn-voice ${isRecording ? 'recording' : ''}`}
            disabled={isLoading}
          >
            {isRecording ? <FaStop /> : <FaMicrophone />}
            {isRecording ? 'Stop' : 'Speak'}
          </button>
        )}
      </div>

      <VoiceStatus
        isVisible={showVoiceStatus}
        isRecording={isRecording}
        transcript={transcript}
        error={null}
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-text-muted text-xs">Quick examples:</span>
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => handleExampleClick(example.text)}
            className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-400/30 transition-colors text-text-secondary hover:text-text-primary"
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading || (!inputText.trim() && !transcript.trim())}
          className="btn-primary flex-1"
        >
          <FaRobot />
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
        <button
          onClick={handleClear}
          className="btn-secondary"
          disabled={isLoading}
        >
          <FaEraser />
          Clear
        </button>
      </div>
    </motion.div>
  );
};

export default FoodInput;