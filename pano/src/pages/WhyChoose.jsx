import React from 'react'
import { Upload, Zap, Download } from 'lucide-react'
import AnimatedContent from '../components/AnimatedContent'
const WhyChoose = () => {
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
    return (
        <div>
            <section id="features" className={`py-20 bg-neutral-950`}>
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
                </AnimatedContent>
            </section>
        </div>
    )
}

export default WhyChoose
