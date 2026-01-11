import React from 'react'
import { Upload } from 'lucide-react';
const ImageUpload = React.memo(({ id, title, preview, onImageChange }) => (
  <div className="bg-neutral-950 w-full max-w-2xl rounded-2xl shadow-xl border border-pink-700 overflow-hidden">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-pink-600" />
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
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-pink-600 hover:bg-neutral-800/50 transition-all duration-300 group"
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
              <Upload className="w-12 h-12 text-pink-700 group-hover:text-pink-600 mb-4 mx-auto transition-colors" />
              <p className="text-gray-400 font-medium mb-2">Drop your image here</p>
              <p className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
        </label>
      </div>
    </div>
  </div>
));

export default ImageUpload
