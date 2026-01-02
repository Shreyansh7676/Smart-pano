import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Zap, Download, ArrowRight, Camera, Sparkles, ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import DarkVeil from '../components/DarkVeil.jsx';
import AnimatedContent from '../components/AnimatedContent.jsx';
import WhyChoose from './WhyChoose.jsx';
import HowItWorks from './HowItWorks.jsx';
import Benefits from './Benefits.jsx';
import Footer from './Footer.jsx';

// Moved outside main component to prevent re-creation on every render
const ImageUpload = React.memo(({ id, title, preview, onImageChange }) => (
  <div className="bg-neutral-950 w-full max-w-2xl rounded-2xl shadow-xl border border-pink-700 overflow-hidden">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-pink-600" />
        {title}
      </h3>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id={id}
        />
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-600 hover:bg-neutral-800/50 transition-all duration-300 group"
        >
          {preview ? (
            <img
              src={preview}
              alt={`${title} Preview`}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-pink-700 group-hover:text-pink-600 mb-4 mx-auto transition-colors" />
              <p className="text-gray-400 font-medium mb-2">Drop your image here</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </label>
      </div>
    </div>
  </div>
));

ImageUpload.displayName = 'ImageUpload';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex flex-row gap-2">
    <div className="w-4 h-4 rounded-full bg-pink-500 animate-bounce" />
    <div className="w-4 h-4 rounded-full bg-pink-500 animate-bounce [animation-delay:-.3s]" />
    <div className="w-4 h-4 rounded-full bg-pink-500 animate-bounce [animation-delay:-.5s]" />
  </div>
);

function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  // Memoize preview URLs to prevent unnecessary recalculations
  const preview1 = image1 ? URL.createObjectURL(image1) : null;
  const preview2 = image2 ? URL.createObjectURL(image2) : null;

  // Cleanup object URLs on unmount or when images change
  useEffect(() => {
    return () => {
      if (preview1) URL.revokeObjectURL(preview1);
      if (preview2) URL.revokeObjectURL(preview2);
    };
  }, [preview1, preview2]);

  // Cleanup result image URL when it changes
  useEffect(() => {
    return () => {
      if (resultImage) URL.revokeObjectURL(resultImage);
    };
  }, [resultImage]);

  const handleImage1Change = useCallback((e) => {
    if (e.target.files?.[0]) {
      setImage1(e.target.files[0]);
      setError(null);
    }
  }, []);

  const handleImage2Change = useCallback((e) => {
    if (e.target.files?.[0]) {
      setImage2(e.target.files[0]);
      setError(null);
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!image1 || !image2) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      const response = await fetch('https://smart-pano-1.onrender.com/stitch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      setResultImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to stitch images:", err.message);
      setError("Image stitching failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [image1, image2]);

  const downloadImage = useCallback(async () => {
    if (!resultRef.current) return;
    
    try {
      const dataUrl = await toPng(resultRef.current);
      const link = document.createElement('a');
      link.download = 'panorama.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
    }
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-black">
      {/* Hero Section */}
      <div className="w-full min-h-screen relative">
        <div className="absolute inset-0 z-0">
          <DarkVeil />
        </div>

        {/* Navigation */}
        <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 w-11/12 md:w-1/2 z-20 bg-black/40 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex items-center space-x-2">
              <Camera className="w-7 h-7 text-white" />
              <span className="font-semibold text-white text-xl md:text-2xl">SmartPano</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-pink-600 transition-colors font-bold">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-pink-600 transition-colors font-bold">
                How It Works
              </a>
            </div>

            <a href="#upload" className="text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors font-bold">
              Get Started
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <AnimatedContent
          distance={100}
          direction="vertical"
          reverse={false}
          duration={1.6}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.0}
          threshold={0.2}
          delay={0}
        >
          <section className="overflow-hidden relative z-10 min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center bg-pink-900/50 text-gray-300 space-x-2 px-4 py-2 rounded-full text-sm font-medium font-manrope mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Panorama Creation</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  Transform Your
                  <span className="block bg-gradient-to-r from-pink-600 to-pink-900 bg-clip-text text-transparent">
                    Images Into
                  </span>
                  <span className="block">Stunning Panoramas</span>
                </h1>
                <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300">
                  Upload multiple images and watch as our advanced AI seamlessly stitches them together
                  into breathtaking panoramic masterpieces. No technical skills required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#upload"
                    className="bg-gradient-to-br from-pink-600 to-rose-950 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                  >
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  <button className="border-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border-gray-600 text-gray-300 hover:border-pink-700 hover:text-pink-600">
                    See Examples
                  </button>
                </div>
              </div>
            </div>
          </section>
        </AnimatedContent>
      </div>

      {/* Features Section */}
      <WhyChoose />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Upload Section */}
      <section id="upload" className="py-20 bg-neutral-950 flex flex-col items-center justify-center">
        <AnimatedContent
          distance={100}
          direction="vertical"
          reverse={false}
          duration={1.6}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity
          scale={1.0}
          threshold={0.2}
          delay={0}
        >
          <h2 className="text-white text-center p-8 text-xl lg:text-4xl font-bold">
            Upload your images below to get started
          </h2>

          <div className="flex items-center justify-center font-sans">
            <div className="flex flex-col lg:flex-row gap-8 mb-12 items-start justify-center max-w-8xl mx-auto p-2">
              <ImageUpload
                id="image1-input"
                title="Upload your left vision image"
                preview={preview1}
                onImageChange={handleImage1Change}
              />
              <ImageUpload
                id="image2-input"
                title="Upload your right vision image"
                preview={preview2}
                onImageChange={handleImage2Change}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Stitch Button */}
          <div className="text-center mb-12">
            <button
              onClick={handleSubmit}
              disabled={!image1 || !image2 || isProcessing}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isProcessing ? <LoadingSpinner /> : (
                <>
                  <Zap className="w-5 h-5 mr-3" />
                  Stitch Images
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          {resultImage && (
            <div className="flex items-center justify-center px-4">
              <div className="bg-neutral-900 rounded-2xl shadow-xl border border-pink-700 overflow-hidden animate-fade-in max-w-4xl w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <ImageIcon className="w-6 h-6 mr-3 text-pink-600" />
                      Stitched Result
                    </h3>
                    <button
                      className="inline-flex items-center px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors duration-200"
                      onClick={downloadImage}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={resultImage}
                      ref={resultRef}
                      alt="Stitched Result"
                      className="w-full h-auto max-h-96 object-contain bg-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatedContent>
      </section>

      {/* Benefits Section */}
      <Benefits />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;