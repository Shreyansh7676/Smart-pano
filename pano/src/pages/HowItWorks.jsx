import React from 'react'
import AnimatedContent from '../components/AnimatedContent'
import { ArrowRight } from 'lucide-react'
const HowItWorks = () => {
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
    return (
        <div>
            <section id="how-it-works" className={`py-20 bg-black `}>
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
                </AnimatedContent>
            </section>
        </div>
    )
}

export default HowItWorks
