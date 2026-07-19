import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCamera, FaTimes } from 'react-icons/fa';
import Card from '../common/Card';

const ImageUpload = ({ onImageUpload, isLoading }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClear = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-lg font-semibold">📸 Upload a food photo</span>
        <span className="bg-info/20 text-info text-xs px-2 py-1 rounded-full">
          Image
        </span>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          preview ? 'border-primary-400/50 bg-primary-400/5' : 'border-white/10 hover:border-primary-400/30'
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Food preview"
              className="max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-sm text-text-muted">{fileName}</p>
            <button
              onClick={handleClear}
              className="text-danger hover:text-danger/80 text-sm transition-colors flex items-center gap-1 mx-auto"
            >
              <FaTimes /> Remove image
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-4xl text-text-muted">
              <FaCloudUploadAlt className="mx-auto" />
            </div>
            <p className="text-text-muted">
              Drag & drop an image here, or click to browse
            </p>
            <p className="text-xs text-text-muted">
              Supports JPG, PNG, GIF, WEBP (Max 5MB)
            </p>
            <label className="btn-primary inline-flex cursor-pointer">
              <FaCamera />
              Browse Files
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageUpload;