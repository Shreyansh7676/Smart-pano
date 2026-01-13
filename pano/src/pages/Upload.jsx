import React, { useState, useEffect, useRef, useCallback } from 'react'
import ImageUpload from './ImageUpload.jsx';
import { Upload, Zap, Download, ArrowRight, Camera, Sparkles, ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import BarLoader from '../components/BarLoader.jsx';

const Uploader = () => {
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const resultRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);
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
        <div className='bg-neutral-950'>
            <section id="upload" className={`max-w-screen py-20 bg-neutral-950 flex flex-col items-center justify-center  transition-all duration-1100 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                <h2 className="text-white text-center p-8 text-xl lg:text-4xl font-bold">
                    Upload your images below to get started
                </h2>

                <div className="flex items-center justify-center font-sans w-full">
                    <div className="flex flex-col lg:flex-row gap-8 mb-6 items-start justify-center w-full max-w-3xl mx-auto p-2">
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
                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={!image1 || !image2 || isProcessing}
                        className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 mb-6 disabled:cursor-not-allowed transform hover:scale-105 hover:text-orange-600 transition-all ease-in duration-200"
                    >
                        {isProcessing ? <BarLoader /> : (
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
                        <div className="bg-orange-700/5 rounded-2xl shadow-xl border border-orange-950 overflow-hidden animate-fade-in max-w-4xl w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center">
                                        <ImageIcon className="w-6 h-6 mr-3 text-orange-700" />
                                        Stitched Result
                                    </h3>
                                    <button
                                        className="inline-flex items-center px-4 py-2 text-gray-400 hover:text-orange-600 font-medium rounded-lg transition-all ease-in duration-200"
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
                                        className="w-full h-auto max-h-96 object-contain bg-gray-900 "
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

export default Uploader
