"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Car } from '@/app/services/api';

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Ensure images array has at least one item
  const carImages = images && images.length > 0 
    ? images 
    : ["/placeholder-image.webp"];

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carImages.length);
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 mb-4">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <Image
          src={carImages[currentIndex]}
          alt={`Car image ${currentIndex + 1}`}
          className="object-cover rounded-lg"
          fill
          priority
        />
      </div>
      
      {/* Navigation arrows */}
      {carImages.length > 1 && (
        <>
          <button
            onClick={goToPrevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor"
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </>
      )}
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
        {currentIndex + 1} / {carImages.length}
      </div>
      
      {/* Thumbnail preview (optional for larger screens) */}
      {carImages.length > 1 && (
        <div className="hidden md:flex mt-2 space-x-2 overflow-x-auto">
          {carImages.map((image, index) => (
            <div 
              key={index}
              className={`relative w-16 h-16 cursor-pointer ${
                index === currentIndex ? 'border-2 border-[#25D366]' : ''
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover rounded"
                fill
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;