import React from 'react'
import { Upload } from 'lucide-react';

const ImageUpload = React.memo(({ id, title, preview, onImageChange }) => (
  <div className="opacity-60 bg-orange-700/5 hover:opacity-100 transition-all ease-in duration-200 grayscale-100 hover:grayscale-0 w-full max-w-3xl rounded-2xl shadow-xl border border-orange-950 overflow-hidden hover:scale-105">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-neutral-400" />
        {title}
      </h3>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          id={id}
        />
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer  transition-all duration-300 group"
        >
          {preview ? (
            <img
              src={preview}
              alt={`${title} Preview`}
              className="w-full h-full object-cover rounded-xl"
            />
            // <div>
            //   <h3 className='text-white'>Image Uploaded</h3>
            // </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-orange-700 mb-4 mx-auto transition-colors" />
              <p className="text-gray-400 font-medium mb-2">Drop your image here</p>
              <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
            </div>
          )}
        </label>
      </div>
    </div>
  </div>
));

export default ImageUpload
