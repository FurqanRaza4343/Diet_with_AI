import React from 'react';
import { motion } from 'framer-motion';
import { FaVolumeUp, FaStop, FaTimes } from 'react-icons/fa';
import Card from '../common/Card';

const AnalysisResult = ({ result, onSpeak, isSpeaking, isTtsSupported, onClear }) => {
  const { analysis, voiceResponse } = result;

  const statusMap = {
    healthy: { label: '✅ Healthy', class: 'status-healthy' },
    moderate: { label: '⚠️ Moderate', class: 'status-moderate' },
    unhealthy: { label: '❌ Unhealthy', class: 'status-unhealthy' },
  };

  const status = statusMap[analysis.healthStatus] || statusMap.moderate;
  const score = analysis.score || 0;
  const scoreColor = score > 70 ? '#4ade80' : score > 40 ? '#fbbf24' : '#f87171';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card border-primary-400/30"
    >
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-xl font-bold">📊 Analysis Result</h3>
          <span className={`status-badge ${status.class}`}>{status.label}</span>
        </div>
        <div className="flex gap-2">
          {isTtsSupported && voiceResponse && (
            <button
              onClick={onSpeak}
              className={`btn-speak ${isSpeaking ? 'speaking' : ''}`}
            >
              {isSpeaking ? <FaStop /> : <FaVolumeUp />}
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>
          )}
          <button
            onClick={onClear}
            className="btn-secondary"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Food Name */}
      <div className="text-xl font-semibold mb-3">
        🍽️ {analysis.detectedFood || 'Unknown Food'}
      </div>

      {/* Score Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-text-muted mb-1">
          <span>Health Score</span>
          <span>{score}/100</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${score}%`,
              background: scoreColor,
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="p-4 bg-white/5 rounded-xl border-l-4 border-primary-400 mb-4">
        <p className="text-text-secondary">{analysis.description || 'Analysis complete.'}</p>
      </div>

      {/* Nutrition Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        {[
          { label: '🔥 Calories', value: analysis.nutrition?.calories || 0, unit: '' },
          { label: '💪 Protein', value: analysis.nutrition?.protein || 0, unit: 'g' },
          { label: '🌾 Carbs', value: analysis.nutrition?.carbs || 0, unit: 'g' },
          { label: '🧈 Fat', value: analysis.nutrition?.fat || 0, unit: 'g' },
          { label: '🌿 Fiber', value: analysis.nutrition?.fiber || 0, unit: 'g' },
          { label: '🍬 Sugar', value: analysis.nutrition?.sugar || 0, unit: 'g' },
        ].map((item, index) => (
          <div key={index} className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-lg font-bold text-primary-400">{item.value}{item.unit}</div>
            <div className="text-xs text-text-muted">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-primary-400 font-semibold mb-2">💡 Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-text-secondary text-sm">✅ {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings?.length > 0 && (
        <div className="mb-3">
          <h4 className="text-danger font-semibold mb-2">⚠️ Warnings</h4>
          <ul className="space-y-1">
            {analysis.warnings.map((warn, index) => (
              <li key={index} className="text-text-secondary text-sm">⚠️ {warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives */}
      {analysis.alternatives?.length > 0 && (
        <div>
          <h4 className="text-info font-semibold mb-2">🔄 Healthy Alternatives</h4>
          <ul className="space-y-1">
            {analysis.alternatives.map((alt, index) => (
              <li key={index} className="text-text-secondary text-sm">🔄 {alt}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default AnalysisResult;