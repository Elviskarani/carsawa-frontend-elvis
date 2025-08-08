"use client";
// components/carcard.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Share2, Heart, Loader2 } from 'lucide-react';
import { toggleFavorite, checkFavoriteStatus, isAuthenticated } from '@/app/services/api';
import AuthModal from '@/app/components/Authmodal';
import { generateCarUrl } from '@/app/services/api';


interface CarCardProps {
  id?: string;
  make: string;
  model: string;
  bodyType: string;
  price: number;
  year: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  engineSize: string;
  status: string;
  images: string[];
  url?: string; // Add this new prop
  onFavoriteChange?: (carId: string, isFavorited: boolean) => void;
}

const CarCard: React.FC<CarCardProps> = ({
  id,
  make,
  model,
  bodyType,
  price,
  year,
  mileage,
  transmission,
  fuelType,
  engineSize,
  status,
  images,
  url, // Add this
  onFavoriteChange
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get the first image or use a placeholder
  const imageUrl = images && images.length > 0 
    ? images[0] 
    : '/placeholder-car.jpg';

  // Check favorite status when component mounts
  useEffect(() => {
    const checkFavoriteStatusOnMount = async () => {
      if (!id || !isAuthenticated()) return;

      try {
        const response = await checkFavoriteStatus(id);
        setIsFavorited(response.isFavorited);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatusOnMount();
  }, [id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }

    setIsLoadingFavorite(true);
    setFavoriteError(null);

    try {
      const response = await toggleFavorite(id);
      setIsFavorited(response.isFavorited);
      
      // Call the callback if provided
      if (onFavoriteChange) {
        onFavoriteChange(id, response.isFavorited);
      }

      // Show success message
      const message = response.isFavorited 
        ? 'Added to favorites!' 
        : 'Removed from favorites!';
      
      // You might want to use a toast notification instead
      console.log(message);
      
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      setFavoriteError(error.message || 'Failed to update favorite');
      
      // You might want to show an error toast
      alert('Failed to update favorite. Please try again.');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create share data
    const shareData = {
      title: `${make} ${model}`,
      text: `Check out this ${year} ${make} ${model} for KES ${price.toLocaleString()}`,
      url: window.location.origin + (url || `/cars/${id}`) // Update this line
    };

    // Use Web Share API if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Could not copy link');
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Optionally refresh the favorite status after successful auth
    if (id && isAuthenticated()) {
      checkFavoriteStatus(id).then(response => {
        setIsFavorited(response.isFavorited);
      }).catch(console.error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <Link href={url || `/cars/${id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={imageUrl}
              alt={`${make} ${model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Status badge */}
            {status && (
              <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' :
                status.toLowerCase() === 'sold' ? 'bg-red-100 text-red-800' :
                status.toLowerCase() === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {status}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-semibold text-[#272D3C]">{make} {model}</h3>
              
              {/* Heart and Share buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleFavoriteClick}
                  disabled={isLoadingFavorite}
                  className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorited 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isLoadingFavorite ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Heart 
                      size={20} 
                      className={isFavorited ? 'fill-current' : ''} 
                    />
                  )}
                </button>
                
                <button
                  onClick={handleShareClick}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:scale-110 transition-all duration-200"
                  aria-label="Share this car"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            
            <p className="text-xl font-bold text-[#272D3C] mb-2">KES {price.toLocaleString()}</p>
            
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span>{year}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{engineSize}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>{transmission}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{mileage.toLocaleString()} km</span>
              </div>
              
              <div className="flex items-center gap-1 col-span-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{fuelType}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default CarCard;