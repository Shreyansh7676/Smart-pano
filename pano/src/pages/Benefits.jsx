import React from 'react'
import AnimatedContent from '../components/AnimatedContent'
import { Check } from 'lucide-react'
const Benefits = () => {
    return (
        <div>


            <section className={`py-20 bg-black`}>
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

                    delay={0}>
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
            </AnimatedContent>
        </section>
        </div >
    )
}

export default Benefits
