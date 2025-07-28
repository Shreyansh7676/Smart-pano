import React from 'react'
import { Camera } from 'lucide-react'
const Footer = () => {
  return (
    <div>
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
  )
}

export default Footer
