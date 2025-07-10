import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaWhatsapp, FaPhoneAlt, FaUser } from 'react-icons/fa';
import { Car, Dealer } from '@/app/services/api';

export interface CarDataPageProps {
  car: Car;
  dealer: Dealer | null;
}

const CarDetailsPage: React.FC<CarDataPageProps> = ({ car, dealer }) => {
  // Create a formatted title from car data
  const title = `${car.year || ''} ${car.name || ''} ${car.make || ''} ${car.model || ''}`.trim() || "Car Details";

  // Create local dealer image path for Next.js Image compatibility
  const dealerImagePath = dealer?.profileImage
    ? dealer.profileImage
    : "/placeholder-image.webp";

    // Prepare comfort features list from API and remove any quotation marks and brackets.
    const comfortFeatures = (Array.isArray(car.comfortFeatures) && car.comfortFeatures.length > 0)
    ? car.comfortFeatures.map(feature => {
      // Remove quotes and brackets if they exist in the feature string
      const cleanedFeature = typeof feature === 'string' ? feature.replace(/['"[\]]+/g, '') : feature;
      return { name: cleanedFeature, value: true };
    })
    : [];

  // Prepare safety features list from API and remove any quotation marks and brackets.
  const safetyFeatures = (Array.isArray(car.safetyFeatures) && car.safetyFeatures.length > 0)
    ? car.safetyFeatures.map(feature => {
      // Remove quotes and brackets if they exist in the feature string
      const cleanedFeature = typeof feature === 'string' ? feature.replace(/['"[\]]+/g, '') : feature;
      return { name: cleanedFeature, value: true };
    })
    : [];

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KSH',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Car key specifications
  const keySpecs = [
    { label: 'Year', value: car.year },
    { label: 'Name', value: car.name },
    { label: 'Make', value: car.make },
    { label: 'Model', value: car.model },
    { label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A' },
    { label: 'Transmission', value: car.transmission || 'N/A' },
    { label: 'Fuel Type', value: car.fuelType || 'N/A' },
    { label: 'Body Type', value: car.bodyType || 'N/A' },
    { label: 'Color', value: car.color || 'N/A' },
    { label: 'Engine Size', value: car.engineSize || 'N/A' },
    { label: 'Condition', value: car.condition || 'N/A' },
  ];

  return (
    <div className="bg-white text-black rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Car Title and Price */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{title}</h1>
          {car.price && (
            <div className="text-lg sm:text-xl font-bold text-[#25D366]">
              {formatPrice(car.price)}
            </div>
          )}
          {car.status && (
            <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${car.status === 'Available' ? 'bg-green-100 text-green-800' :
                car.status === 'Sold' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
              }`}>
              {car.status}
            </div>
          )}
        </div>

        {/* Key Specifications */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold text-lg mb-3">Key Specifications</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {keySpecs.map((spec, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-xs text-gray-500">{spec.label}</span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dealer Information */}
        <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="font-semibold text-lg mb-3">Dealer Information</h2>

          {dealer ? (
            <>
              <Link
                href={`/dealers/${dealer.id || dealer._id}`}
                className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition mb-4"
              >
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mr-4">
                  <Image
                    src={dealerImagePath}
                    alt={dealer.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base">{dealer.name}</h3>
                  <p className="text-xs text-gray-500">{dealer.location?.address || 'Location not specified'}</p>                </div>
              </Link>
            </>
          ) : (
            <div className="flex items-center justify-center p-4 text-gray-500">
              <FaUser className="mr-2" />
              <span>Dealer information not available</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          {dealer?.whatsapp && (
            <button
              className="flex-1 bg-[#272D3C] text-white py-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-[#25D366] transition shadow-md"
              onClick={() =>
                window.open(
                  `https://wa.me/${dealer.whatsapp}?text=Enquiry about ${title}`,
                  '_blank'
                )
              }
            >
              <FaWhatsapp className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm font-semibold">Start a conversation</div>
                <div className="text-xs opacity-90">Talk to the sales agent</div>
              </div>
            </button>
          )}
          {dealer?.phone && (
            <button
              className="flex-1 bg-gray-100 text-black py-4 rounded-lg border border-gray-300 flex items-center hover:bg-gray-200 transition justify-center space-x-3 shadow-md"
              onClick={() => window.open(`tel:${dealer.phone}`)}
            >
              <FaPhoneAlt className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm font-semibold">Make an Enquiry</div>
                <div className="text-xs text-gray-600">Start the conversation</div>
              </div>
            </button>
          )}
        </div>

        {/* Features & Specifications Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold">Features</h2>
          </div>

          {/* Basic Features Grid */}


          {/* Comfort Features Section */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4">Comfort Features</h3>
            {comfortFeatures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comfortFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{feature.name}</span>
                    {feature.value === true ? (
                      <span className="text-green-500 font-bold">✓</span>
                    ) : (
                      <span className="text-sm text-gray-400">{String(feature.value) || '-'}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                Comfort features not specified.
              </p>
            )}
          </div>

          {/* Safety Features Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Safety Features</h3>
            {safetyFeatures.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safetyFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm">{feature.name}</span>
                    {feature.value === true ? (
                      <span className="text-green-500 font-bold">✓</span>
                    ) : (
                      <span className="text-sm text-gray-400">{String(feature.value) || '-'}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                Safety features not specified.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;