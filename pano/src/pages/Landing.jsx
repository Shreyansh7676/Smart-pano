import React, { useState, useRef } from 'react';
import { Upload, Image, Zap, Download, ArrowRight, Check, Camera, Sparkles, Globe, Users, Moon, Sun, ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import DarkVeil from '../components/DarkVeil.jsx';
import SplitText from '../components/SplitTest.jsx';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import  AnimatedContent  from '../components/AnimatedContent.jsx';



function App() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
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

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Easy Upload",
      description: "Simply drag and drop or select multiple images from your device"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Stitching",
      description: "Advanced algorithms automatically align and blend your images seamlessly"
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "High Quality Output",
      description: "Get professional-grade panoramic images in high resolution"
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Upload Images",
      description: "Select 2 or more overlapping images from your collection"
    },
    {
      step: "02",
      title: "AI Processing",
      description: "Our smart algorithm analyzes and aligns your images automatically"
    },
    {
      step: "03",
      title: "Download Result",
      description: "Get your stunning panoramic image ready for sharing"
    }



  ];
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


  const handleImage1Change = (e) => {
    const file = e.target.files[0];
    setImage1(file);
    setPreview1(URL.createObjectURL(file));
  };

  const handleImage2Change = (e) => {
    const file = e.target.files[0];
    setImage2(file);
    setPreview2(URL.createObjectURL(file));
  };

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
        <div className='flex items-center justify-center max-w-4xl relative z-50 mx-auto pt-10'>
          <nav className={`backdrop-blur-sm flex justify-between border px-8 border-white rounded-4xl z-50 transition-colors duration-300 bg-neutral-600/40`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between gap-8 h-16">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-white bg-clip-text text-transparent">
                    SmartPano
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-8">
                    <a href="#features" className={`transition-colors text-gray-300 hover:text-pink-500`}>Features</a>
                    <a href="#how-it-works" className={`transition-colors text-gray-300 hover:text-pink-500`}>How It Works</a>
                    <a href="#upload" className="bg-transparent rounded-4xl text-white py-2 hover:text-pink-500 transition-all duration-300">
                      Get Started
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Content positioned relatively to appear above background */}
        <AnimatedContent

          distance={100}

          direction="vertical"

          reverse={false}

          duration={1.2}

          ease="power3.out"

          initialOpacity={0}

          animateOpacity

          scale={1.0}

          threshold={0.1}

          delay={0}

        >

          <section className="overflow-hidden relative z-10 min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className={`inline-flex items-center bg-pink-900/50 text-gray-300 space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-4`}>
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
                {/* <SplitText
                text="Transform Your"
                className="text-center text-5xl md:text-7xl font-bold text-white mb-6"
                delay={100}
                duration={0.1}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
              /> */}
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
                  <button className={`border-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400`}>
                    See Examples
                  </button>
                </div>
              </div>
            </div>
          </section>

        </AnimatedContent>

      </div>




      {/* Features Section */}
      <section id="features" className={`py-20 bg-neutral-950`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 text-white`}>
              Why Choose SmartPano?
            </h2>
            <p className={`text-xl max-w-3xl mx-auto text-gray-300`}>
              Experience the future of panoramic photography with our cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-900  bg-neutral-950 transform hover:scale-105 `}>
                <div className={`mb-4 text-pink-700 `}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 text-white `}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed text-gray-300 `}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`py-20 bg-black `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 text-white`}>
              How It Works
            </h2>
            <p className={`text-xl max-w-3xl mx-auto text-gray-300`}>
              Create stunning panoramas in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <h3 className={`text-xl font-semibold mb-3 text-white `}>
                  {step.title}
                </h3>
                <p className={`leading-relaxed text-gray-300`}>
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 transform translate-x-8 w-full">
                    <ArrowRight className={`w-6 h-6 mx-auto text-gray-600 `} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className={`py-20 bg-neutral-950 flex flex-col items-center justify-center`}>
           <h1 className='text-white text-center p-8 text-xl lg:text-4xl font-bold'> Upload your images below to get started</h1>
        <div className="flex flex-col lg:flex-row gap-8 mb-12 items-center justify-center max-w-7xl mx-auto px-4">
          {/* Image 1 Upload */}
          <div className={`bg-neutral-950 w-full max-w-2xl items-center rounded-2xl shadow-xl border border-pink-700 overflow-hidden`}>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-pink-600" />
                First Image
              </h3>

              <div className="relative">
                <input
                  type="file" accept="image/*" onChange={handleImage1Change}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="image1-input"
                />
                <label
                  htmlFor="image1-input"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-600 hover:bg-indigo-50 transition-all duration-300 group"
                >
                  {preview1 ? (
                    <img
                      src={preview1}
                      alt="Preview 1"
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

          {/* Image 2 Upload */}
          <div className="bg-neutral-950 rounded-2xl w-full max-w-2xl shadow-xl border border-pink-700 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-pink-700" />
                Second Image
              </h3>

              <div className="relative">
                <input
                  type="file" accept="image/*" onChange={handleImage2Change}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="image2-input"
                />
                <label
                  htmlFor="image2-input"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-700 hover:bg-purple-50 transition-all duration-300 group"
                >
                  {preview2 ? (
                    <img
                      src={preview2}
                      alt="Preview 2"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-pink-700 group-hover:text-pink-700 mb-4 mx-auto transition-colors" />
                      <p className="text-gray-400 font-medium mb-2">Drop your image here</p>
                      <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
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
                <div className="animate-spin cursor-not-allowed rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-3" />
                Stitch Images
              </>
            )}
          </button>
          {/* {resultImage && (
          <div>
            <h3>Stitched Image:</h3>
            <img src={resultImage} className='h-48' alt="Stitched Result" />
          </div>
        )} */}
        </div>
        <div className='flex items-center justify-center'>
          {resultImage && (
            <div className="bg-neutral-950 rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <ImageIcon className="w-6 h-6 mr-3 text-green-600" />
                    Stitched Result
                  </h3>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
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

      </section>

      {/* Benefits Section */}
      <section className={`py-20 bg-black`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className={`text-4xl font-bold mb-6 text-white`}>
                Professional Results,
                <span className="block text-pink-600">Zero Hassle</span>
              </h2>
              <p className={`text-xl mb-8 text-gray-300 `}>
                Whether you're a photographer, traveler, or just love capturing memories,
                SmartPano makes it easy to create stunning panoramic images that tell your story.
              </p>

              <div className="space-y-4">
                {[
                  "Automatic image alignment and blending",
                  "Support for all image formats",
                  "High-resolution output up to 8K",
                  "No watermarks or limits",
                  "Instant processing with AI acceleration"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-green-600`}>
                      <Check className={`w-4 h-4 text-white `} />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="border border-pink-700 rounded-2xl p-8 text-white">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Ready to get started ?</h3>
                  <p className="text-blue-100">
                    Join thousands of users creating amazing panoramas every day.
                  </p>
                </div>
                <a
                  href="#upload"
                  className="bg-gradient-to-br from-pink-600 to-pink-950 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 inline-block"
                >
                  Start Creating Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 bg-neutral-950  text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10  rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">SmartPano</span>
            </div>
            <p className="text-gray-400 mb-8">
              Transform your images into stunning panoramas with the power of AI
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-500">
                © 2024 SmartPano. All rights reserved. Built with ❤️ for photographers and creators.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;