import { Upload, Zap, Download } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
const WhyChoose = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target); // Stop observing after animation triggers
                }
            },
            { threshold: 0.2 } // Trigger when 20% of the element is visible
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);
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
            <section id="features" ref={sectionRef} className={`py-20 bg-neutral-950`}>
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl font-bold mb-4 text-white`}>
                            How It Works ?
                        </h2>
                        <p className={`text-xl max-w-3xl mx-auto text-gray-300`}>
                            Create stunning panoramas in just three simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className={`opacity-50 hover:opacity-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border grayscale-100 hover:grayscale-0 border-gray-900  bg-white/5 hover:bg-blue-600/5 hover:border-blue-950 transform hover:scale-105 `}>
                                <div className={`mb-4 text-blue-500`}>
                                    {feature.icon}
                                </div>
                                <h3 className={`text-xl font-semibold mb-3 text-white`}>
                                    {feature.title}
                                </h3>
                                <p className={`leading-relaxed text-gray-300`}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default WhyChoose
