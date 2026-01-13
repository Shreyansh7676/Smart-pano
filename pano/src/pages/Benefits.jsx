import { Check } from 'lucide-react'
import Img1 from '../assets/Untitled design.png'
const Benefits = () => {
    return (
        <div>
            <section className={`py-20 bg-neutral-950`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className={`text-4xl font-bold mb-6 text-white`}>
                                Professional Results,
                                <span className="block text-white">Zero Hassle</span>
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
                                        <div className={`w-6 h-6 border border-green-500 rounded-full flex items-center justify-center`}>
                                            <Check className={`w-4 h-4 text-green-500 `} />
                                        </div>
                                        <span className="text-gray-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div>
                                <img src={Img1} alt="Abstract Background" />
                            </div>
                        </div>
                    </div>
                </div>
        </section>
        </div >
    )
}

export default Benefits
