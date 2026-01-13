import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Zap, Download, ArrowRight, Camera, Sparkles, ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import WhyChoose from './WhyChoose.jsx';
import Benefits from './Benefits.jsx';
import Footer from './Footer.jsx';
import Uploader from './Upload.jsx';
import ColorBends from '../components/ColorBends.jsx';
// ImageUpload.displayName = 'ImageUpload';


function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="w-full min-h-screen relative overflow-hidden">
        <div className={`absolute inset-0 z-0 opacity-70 transition-transform duration-900 ease-out ${isLoaded ? 'scale-100' : 'scale-130'}`}>
          <ColorBends
            color="#000000"
          />
        </div>

        {/* Hero Content */}
          <section className={`overflow-hidden relative z-10 min-h-screen flex items-center transition-transform duration-900 ease-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-70 opacity-30'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center bg-white/15 backdrop-blur-md text-gray-300 space-x-2 px-4 py-2 rounded-full text-sm font-medium font-manrope mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-Powered Panorama Creation</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Transform Your
                  <span className="block">
                    Images Into
                  </span>
                  <span className="block">Stunning Panoramas</span>
                </h1>
                <p className="text-xl mb-12 max-w-3xl mx-auto leading-relaxed text-white">
                  Upload multiple images and watch as our advanced AI seamlessly stitches them together
                  into breathtaking panoramic masterpieces. No technical skills required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#upload"
                    className="text-gray-400 px-6 py-2 rounded-xl text-md font-normal transition-all ease-in duration-300 hover:text-white inline-flex items-center justify-center"
                  >
                    Start Creating Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  {/* <button className="border-1 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border-white-600 text-gray-300 hover:border-blue-950 hover:text-blue-900">
                    See Examples
                  </button> */}
                </div>
              </div>
            </div>
          </section>
      </div>

      {/* Features Section */}
      <WhyChoose />

      {/* Upload Section */}
      <Uploader />

      {/* Benefits Section */}
      <Benefits />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;