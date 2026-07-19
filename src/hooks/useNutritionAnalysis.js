import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { nutritionService } from '../services/nutritionService';

export const useNutritionAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyzeFood = useCallback(async (text, language = 'en') => {
    if (!text.trim()) {
      toast.error('Please describe what you ate');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await nutritionService.analyzeFood(text, language);
      
      if (response.success) {
        const dbRecord = response.data;
        const r = dbRecord.result || {};
        setResult({
          analysis: {
            healthStatus: r.healthScore >= 70 ? 'healthy' : r.healthScore >= 40 ? 'moderate' : 'unhealthy',
            score: r.healthScore || 0,
            detectedFood: r.foodName || 'Unknown Food',
            description: `Analysis of ${r.foodName || 'food'} complete.`,
            nutrition: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, fiber: r.fiber, sugar: r.sugar },
            recommendations: r.recommendations || [],
            warnings: r.warnings || [],
            alternatives: [],
          },
          voiceResponse: r.voiceResponse || '',
        });
        toast.success('Analysis complete!');
        return response.data;
      } else {
        throw new Error(response.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to analyze food');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeImage = useCallback(async (imageFile, language = 'en') => {
    if (!imageFile) {
      toast.error('Please select an image');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await nutritionService.analyzeFoodImage(imageFile, language);
      
      if (response.success) {
        const dbRecord = response.data;
        const r = dbRecord.result || {};
        setResult({
          analysis: {
            healthStatus: r.healthScore >= 70 ? 'healthy' : r.healthScore >= 40 ? 'moderate' : 'unhealthy',
            score: r.healthScore || 0,
            detectedFood: r.foodName || 'Unknown Food',
            description: `Analysis of ${r.foodName || 'food'} complete.`,
            nutrition: { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat, fiber: r.fiber, sugar: r.sugar },
            recommendations: r.recommendations || [],
            warnings: r.warnings || [],
            alternatives: [],
          },
          voiceResponse: r.voiceResponse || '',
        });
        toast.success('Image analysis complete!');
        return response.data;
      } else {
        throw new Error(response.message || 'Image analysis failed');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to analyze image');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const fetchHistory = useCallback(async (page = 1, limit = 10) => {
    try {
      const response = await nutritionService.getAnalysisHistory(page, limit);
      if (response.success) {
        setHistory(response.data);
        return response.data;
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  return {
    loading,
    result,
    error,
    history,
    analyzeFood,
    analyzeImage,
    clearResult,
    fetchHistory,
  };
};