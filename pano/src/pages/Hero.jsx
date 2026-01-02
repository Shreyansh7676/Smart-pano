import React, { useState } from 'react';

const ImageUploader = () => {
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);
    const [resultImage, setResultImage] = useState(null);       

    const handleImage1Change = (e) => {
        const file = e.target.files[0];
        setImage1(file);
        setPreview1(URL.createObjectURL(file));
    };

    const handleImage2Change = (e) => {
        const file = e.target.files[0];
        setImage2(file);
        setPreview2(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
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
            alert("Image stitching failed. See console for details.");
        }
    };


    // const blob = await response.blob();
    // const stitchedImageURL = URL.createObjectURL(blob);
    // window.open(stitchedImageURL, '_blank'); // opens result in new tab
    return (
    <div>
        <div>
            <label>Image 1:</label>
            <input type="file" accept="image/*" onChange={handleImage1Change} />
            {preview1 && <img src={preview1} alt="Preview 1" />}
        </div>

        <div>
            <label>Image 2:</label>
            <input type="file" accept="image/*" onChange={handleImage2Change} />
            {preview2 && <img src={preview2} alt="Preview 2" />}
        </div>

        <button
            onClick={handleSubmit}
            
        >
            Stitch Images
        </button>

        {resultImage && (
            <div>
                <h3>Stitched Image:</h3>
                <img src={resultImage} alt="Stitched Result" />
            </div>
        )}
    </div>
);
};




export default ImageUploader;
