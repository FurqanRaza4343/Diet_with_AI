import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { nutritionService } from '../../services/nutritionService';
import { Camera, Upload, X, RotateCcw, Search, Clock, Image as ImageIcon, AlertCircle, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import CameraViewfinder from '../../components/camera/CameraViewfinder';

const FoodScannerPage = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [foodName, setFoodName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await nutritionService.getAnalysisHistory(1, 20);
      if (res.success) setHistory(res.data || []);
    } catch {} finally { setLoadingHistory(false); }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WEBP, or GIF image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setSelectedFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      let res;
      if (foodName.trim()) {
        res = await nutritionService.analyzeFoodByName(foodName.trim());
      } else if (selectedFile) {
        res = await nutritionService.analyzeFoodImage(selectedFile);
      } else {
        toast.error('Upload an image or type a food name');
        setAnalyzing(false); return;
      }
      if (res.success) { setResult(res.data); toast.success('Analysis complete!'); fetchHistory(); }
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    }
    finally { setAnalyzing(false); }
  };

  const handleReset = () => { setSelectedFile(null); setPreview(null); setResult(null); setFoodName(''); setShowTextInput(false); };

  const analysis = result?.result || result;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
          <Camera className="text-primary-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Smart Food Scanner</h1>
          <p className="text-on-surface-variant text-sm">Upload food images to get instant nutrition info</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div>
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-[#e5e1e3]'} ${preview ? 'h-auto' : 'h-80 flex flex-col items-center justify-center'}`}
          >
            {showCamera ? (
              <CameraViewfinder onCapture={(file) => { setShowCamera(false); handleFile(file); }} onClose={() => setShowCamera(false)} />
            ) : showTextInput ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Type className="text-primary-500" size={32} />
                </div>
                <p className="text-on-surface font-medium mb-1">What food did you eat?</p>
                <p className="text-on-surface-variant text-sm mb-4">Type the name of the food or dish</p>
                <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f6f3f4] border border-[#e5e1e3] rounded-xl text-on-surface focus:ring-2 focus:ring-primary-300 outline-none transition-all mb-3" placeholder="e.g. Chicken Biryani, Apple, Salad" autoFocus />
                <div className="flex gap-3">
                  <button onClick={() => { setShowTextInput(false); setFoodName(''); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] transition-colors">
                    Back
                  </button>
                  <button onClick={handleAnalyze} disabled={!foodName.trim() || analyzing}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                    {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing</> : <><Search size={16} /> Analyze</>}
                  </button>
                </div>
              </div>
            ) : preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-72 rounded-xl mx-auto object-contain" />
                <button onClick={handleReset} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-primary-500" size={32} />
                </div>
                <p className="text-on-surface font-medium mb-1">Drop your food image here</p>
                <p className="text-on-surface-variant text-sm mb-4">or click to browse (JPG, PNG, WEBP · max 5MB)</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                    <Upload size={16} /> Browse
                  </button>
                  <button onClick={() => setShowCamera(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
                    <Camera size={16} /> Camera
                  </button>
                  <button onClick={() => setShowTextInput(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors bg-[#f6f3f4] text-on-surface hover:bg-[#e5e1e3] flex items-center gap-2">
                    <Type size={16} /> Type Food Name
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])} />
              </div>
            )}
          </div>

          {preview && !result && (
            <button onClick={handleAnalyze} disabled={analyzing}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {analyzing ? <>Analyzing <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></> : <><Search size={18} /> Analyze Food</>}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {analyzing && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-[#e5e1e3] p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-on-surface font-medium">Analyzing your food...</p>
              <p className="text-on-surface-variant text-sm mt-1">AI is detecting ingredients and nutrition info</p>
            </motion.div>
          )}

          {result && !analyzing && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-on-surface">Nutrition Analysis</h2>
                <button onClick={handleReset} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <RotateCcw size={14} /> Scan Again
                </button>
              </div>

              {analysis?.healthScore !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Health Score</span>
                    <span className="font-semibold text-on-surface">{analysis.healthScore}/100</span>
                  </div>
                  <div className="h-2.5 bg-[#f1edee] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${analysis.healthScore >= 70 ? 'bg-green-500' : analysis.healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${analysis.healthScore}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Calories', value: analysis?.calories ? `${analysis.calories} kcal` : '--' },
                  { label: 'Protein', value: analysis?.protein ? `${analysis.protein}g` : '--' },
                  { label: 'Carbs', value: analysis?.carbs ? `${analysis.carbs}g` : '--' },
                  { label: 'Fat', value: analysis?.fat ? `${analysis.fat}g` : '--' },
                  { label: 'Fiber', value: analysis?.fiber ? `${analysis.fiber}g` : '--' },
                  { label: 'Sugar', value: analysis?.sugar ? `${analysis.sugar}g` : '--' },
                ].map((n, i) => (
                  <div key={i} className="bg-[#f6f3f4] rounded-xl p-3">
                    <p className="text-xs text-on-surface-variant">{n.label}</p>
                    <p className="text-sm font-bold text-on-surface">{n.value}</p>
                  </div>
                ))}
              </div>

              {analysis?.foodName && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant">Detected Food</p>
                  <p className="font-medium text-on-surface">{analysis.foodName}</p>
                </div>
              )}

              {analysis?.ingredients && analysis.ingredients.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant mb-1">Detected Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.ingredients.map((ing, i) => (
                      <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis?.warnings && analysis.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800">Warnings</p>
                    {analysis.warnings.map((w, i) => <p key={i} className="text-xs text-amber-700">{w}</p>)}
                  </div>
                </div>
              )}

              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-on-surface-variant mb-1">Recommendations</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((r, i) => (
                      <li key={i} className="text-xs text-on-surface flex gap-1.5">
                        <span className="text-green-500">•</span> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {!result && !analyzing && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-[#e5e1e3] p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
              <Camera size={48} className="text-[#e5e1e3] mb-4" />
              <p className="text-on-surface-variant">Upload or capture a food image</p>
              <p className="text-on-surface-variant text-sm mt-1">to see nutrition analysis here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e1e3] p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Clock size={18} className="text-primary-600" /> Scan History
        </h3>
        {loadingHistory ? (
          <div className="text-center py-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">No scans yet</div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const r = item.result || {};
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#f6f3f4] rounded-xl">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                        <ImageIcon size={20} className="text-primary-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-on-surface">{r.foodName || 'Unknown food'}</p>
                      <p className="text-xs text-on-surface-variant">{r.calories ? `${r.calories} kcal` : ''} · {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    {r.healthScore !== undefined && (
                      <span className={`font-medium ${r.healthScore >= 70 ? 'text-green-600' : r.healthScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {r.healthScore}/100
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodScannerPage;
