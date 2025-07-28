import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Upload, Image, Zap, Download, ArrowRight, Check, Camera, Sparkles, Globe, Users, Moon, Sun, ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import DarkVeil from '../components/DarkVeil.jsx';
import SplitText from '../components/SplitTest.jsx';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import AnimatedContent from '../components/AnimatedContent.jsx';
import WhyChoose from './WhyChoose.jsx';
import HowItWorks from './HowItWorks.jsx';
import Benefits from './Benefits.jsx';
import Footer from './Footer.jsx';



function App() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const preview1 = image1 ? URL.createObjectURL(image1) : null;
  const preview2 = image2 ? URL.createObjectURL(image2) : null;
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const domEl = useRef(null);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    setUploadedImages(prev => [...prev, ...files]);
  };

  const ImageUpload = React.memo(({ id, title, preview, onImageChange }) => {
    console.log(`Rendering ImageUpload for: ${title}`); // This will show when the component re-renders
    return (
      <div className="bg-neutral-950 w-full max-w-2xl rounded-2xl shadow-xl border border-pink-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-pink-600" />
            {title}
          </h3>
          <div className="relative">
            {/* The input element calls the passed-in change handler */}
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
    );
  });

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length !== 2) {
      alert("Please select exactly 2 images.");
      return;
    }
    setImage1(files[0]);
    setImage2(files[1]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      const response = await fetch('http://127.0.0.1:5000/stitch', {
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
      alert("Image stitching failed. See console for details.");
    }
  }

  const handleImage1Change = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setImage1(e.target.files[0]);
    }
  }, []);

  const handleImage2Change = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setImage2(e.target.files[0]);
    }
  }, []);

  // This `useEffect` hook is crucial for performance and memory management.
  // It cleans up the object URLs created by `URL.createObjectURL` when the
  // component unmounts or the image changes, preventing memory leaks.
  useEffect(() => {
    return () => {
      if (preview1) URL.revokeObjectURL(preview1);
      if (preview2) URL.revokeObjectURL(preview2);
    };
  }, [preview1, preview2]);

  const downloadImage = async () => {
    const dataUrl = await htmlToImage.toPng(domEl.current);
    // download image
    const link = document.createElement('a');
    link.download = 'html-to-img.png';
    link.href = dataUrl;
    link.click();
  };
  return (
    <div className={`min-h-screen transition-colors duration-300 bg-black`}>
      {/* Navigation */}
      {/* Hero Section with animated background that covers from top */}
      <div className='w-full min-h-screen relative'>
        {/* Background component positioned absolutely to cover from very top */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <DarkVeil />
        </div>

        {/* Navigation positioned above background */}
        <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 w-1/2 z-10 bg-black/40 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <a href="#" className="w-8 h-8  rounded-full flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </a>
              <span className="font-semibold text-white text-2xl">SmartPano</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-end space-x-6">
              <a href="#features" className="text-gray-300 hover:text-pink-600 transition-colors font-bold">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-pink-600 transition-colors font-bold">
                How It Works
              </a>
            </div>

            {/* CTA Button */}
            <a href='#upload' className=" text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors font-bold">
              Get Started
            </a>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Content positioned relatively to appear above background */}
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
                <div className={`inline-flex items-center bg-pink-900/50 text-gray-300 space-x-2 px-4 py-2 rounded-full text-sm font-medium font-manrope mb-4`}>
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Panorama Creation</span>
                </div>
                <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6`}>
                  Transform Your
                  <span className="block bg-gradient-to-r from-pink-600 to-pink-900 bg-clip-text text-transparent">
                    Images Into
                  </span>
                  <span className="block">Stunning Panoramas</span>
                </h1>
                <p className={`text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300`}>
                  Upload multiple images and watch as our advanced AI seamlessly stitches them together
                  into breathtaking panoramic masterpieces. No technical skills required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#upload"
                    className="bg-gradient-to-br from-pink-600 to-rose-950 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </a>
                  <button className={`border-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border-gray-600 text-gray-300 hover:border-pink-700 hover:text-pink-600`}>
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
      <section id="upload" className={`py-20 bg-neutral-950 flex flex-col items-center justify-center`}>
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
          <h1 className='text-white text-center p-8 text-xl lg:text-4xl font-bold'> Upload your images below to get started</h1>

          <div className="flex items-center justify-center font-sans">
            <div className="flex flex-col lg:flex-row gap-8 mb-12 items-start justify-center max-w-7xl mx-auto p-4">
              <ImageUpload
                id="image1-input"
                title="First Image"
                preview={preview1}
                onImageChange={handleImage1Change}
              />
              <ImageUpload
                id="image2-input"
                title="Second Image"
                preview={preview2}
                onImageChange={handleImage2Change}
              />
            </div>
          </div>
          {/* Stitch Button */}
          <div className="text-center mb-12">
            <button
              onClick={handleSubmit}
              disabled={!image1 || !image2 || isProcessing}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-pink-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isProcessing ? (
                <>
                  <div class="flex flex-row gap-2">
                    <div class="w-4 h-4 rounded-full bg-red-500 animate-bounce"></div>
                    <div
                      class="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]"
                    ></div>
                    <div
                      class="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]"
                    ></div>
                  </div>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-3" />
                  Stitch Images
                </>
              )}
            </button>


          </div>
          <div className='flex items-center justify-center'>
            {resultImage && (
              <div className="bg-neutral-900 rounded-2xl shadow-xl border border-pink-700 overflow-hidden animate-fade-in">
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
                      ref={domEl}
                      alt="Stitched Result"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Result Section */}
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