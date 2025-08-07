import React, { useState } from 'react';
import { Car } from '@/app/services/api';

interface ComparisonModalProps {
  selectedCars: Car[];
  onRemoveCar: (carId: string) => void;
  onClearAll: () => void;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({
  selectedCars,
  onRemoveCar,
  onClearAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedCars.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFirstImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : '/placeholder-car.jpg';
  };

  const getCarId = (car: Car) => car._id || car.id || `${car.make}-${car.model}-${car.year}`;

  // Get comfort features with cleaning logic (same as cardata.tsx)
  const getComfortFeatures = (car: Car, limit?: number) => {
    const features = (Array.isArray(car.comfortFeatures) && car.comfortFeatures.length > 0)
      ? car.comfortFeatures.map(feature => {
          // Remove quotes and brackets if they exist in the feature string
          const cleanedFeature = typeof feature === 'string' ? feature.replace(/['"[\]]+/g, '') : feature;
          return cleanedFeature;
        })
      : [];
    return limit ? features.slice(0, limit) : features;
  };

  // Get safety features with cleaning logic (same as cardata.tsx)
  const getSafetyFeatures = (car: Car) => {
    return (Array.isArray(car.safetyFeatures) && car.safetyFeatures.length > 0)
      ? car.safetyFeatures.map(feature => {
          // Remove quotes and brackets if they exist in the feature string
          const cleanedFeature = typeof feature === 'string' ? feature.replace(/['"[\]]+/g, '') : feature;
          return cleanedFeature;
        })
      : [];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-8 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Compare Vehicles ({selectedCars.length}/4)
              </h3>
              <p className="text-sm text-gray-600">
                Compare features and specifications side by side
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {!isExpanded && selectedCars.length > 1 && (
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View Full Comparison
              </button>
            )}
            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Collapse
              </button>
            )}
            <button
              onClick={onClearAll}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Content */}
      <div className="p-6">
        {/* Car Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {selectedCars.map((car) => (
            <div key={getCarId(car)} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Remove Button */}
              <button
                onClick={() => onRemoveCar(getCarId(car))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 z-10"
              >
                ×
              </button>

              {/* Car Image */}
              <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-gray-200">
                <img
                  src={getFirstImage(car.images)}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-car.jpg';
                  }}
                />
              </div>

              {/* Car Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {car.make} {car.model}
                </h4>
                <p className="text-blue-600 font-bold text-lg">
                  {formatPrice(car.price)}
                </p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{car.year} • {car.mileage?.toLocaleString()} km</p>
                  <p>{car.fuelType} • {car.transmission}</p>
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => window.open(`/cars/${getCarId(car)}`, '_blank')}
                className="w-full mt-3 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Comparison (when expanded) */}
        {isExpanded && selectedCars.length > 1 && (
          <div className="space-y-6">
            {/* Specifications Comparison */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Specifications</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600">Feature</th>
                      {selectedCars.map((car) => (
                        <th key={getCarId(car)} className="text-left py-2 text-gray-900 min-w-[120px]">
                          {car.make} {car.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Price</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2 font-bold text-blue-600">
                          {formatPrice(car.price)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Year</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.year}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Mileage</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.mileage?.toLocaleString()} km</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Engine Size</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.engineSize || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Fuel Type</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.fuelType}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Transmission</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.transmission}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Body Type</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.bodyType}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Color</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">{car.color || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 font-medium text-gray-600">Condition</td>
                      {selectedCars.map((car) => (
                        <td key={getCarId(car)} className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            car.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                            car.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {car.condition}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comfort Features Comparison - Updated Format with cleaning */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Comfort Features</h4>
              <div className="overflow-x-auto">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, 1fr)` }}>
                  {/* Car Headers */}
                  {selectedCars.map((car) => (
                    <div key={getCarId(car)} className="space-y-3">
                      <h5 className="font-medium text-gray-900 text-center border-b border-gray-200 pb-2">
                        {car.make} {car.model}
                      </h5>
                      <div className="space-y-2">
                        {getComfortFeatures(car).length > 0 ? (
                          getComfortFeatures(car).map((feature, index) => (
                            <div key={index} className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                            <span className="text-sm text-gray-500 italic">No features listed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Features Comparison with cleaning */}
            {selectedCars.some(car => getSafetyFeatures(car).length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Safety Features</h4>
                <div className="overflow-x-auto">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, 1fr)` }}>
                    {selectedCars.map((car) => (
                      <div key={getCarId(car)} className="space-y-3">
                        <h5 className="font-medium text-gray-900 text-center border-b border-gray-200 pb-2">
                          {car.make} {car.model}
                        </h5>
                        <div className="space-y-2">
                          {getSafetyFeatures(car).length > 0 ? (
                            getSafetyFeatures(car).map((feature, index) => (
                              <div key={index} className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                              <span className="text-sm text-gray-500 italic">No features listed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview mode - show basic info and first 5 comfort features */}
        {!isExpanded && selectedCars.length > 1 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Quick Comparison Preview</h4>
              <p className="text-sm text-gray-600">Expand for detailed comparison</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Feature</th>
                    {selectedCars.map((car) => (
                      <th key={getCarId(car)} className="text-left py-2 text-gray-900 min-w-[120px]">
                        {car.make} {car.model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 font-medium text-gray-600">Price</td>
                    {selectedCars.map((car) => (
                      <td key={getCarId(car)} className="py-2 font-bold text-blue-600">
                        {formatPrice(car.price)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-gray-600">Year • Mileage</td>
                    {selectedCars.map((car) => (
                      <td key={getCarId(car)} className="py-2">
                        {car.year} • {car.mileage?.toLocaleString()} km
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-gray-600">Fuel • Transmission</td>
                    {selectedCars.map((car) => (
                      <td key={getCarId(car)} className="py-2">
                        {car.fuelType} • {car.transmission}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Preview of comfort features - Updated Format with cleaning */}
            {selectedCars.some(car => getComfortFeatures(car, 5).length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-700 mb-2">Comfort Features Preview</h5>
                <div className="overflow-x-auto">
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCars.length}, 1fr)` }}>
                    {selectedCars.map((car) => (
                      <div key={getCarId(car)} className="space-y-2">
                        <h6 className="font-medium text-gray-800 text-sm text-center border-b border-gray-200 pb-1">
                          {car.make} {car.model}
                        </h6>
                        <div className="space-y-1">
                          {getComfortFeatures(car, 5).length > 0 ? (
                            getComfortFeatures(car, 5).map((feature, index) => (
                              <div key={index} className="bg-white rounded px-2 py-1 border border-gray-200">
                                <span className="text-xs text-gray-600">{feature}</span>
                              </div>
                            ))
                          ) : (
                            <div className="bg-white rounded px-2 py-1 border border-gray-200">
                              <span className="text-xs text-gray-400 italic">No features</span>
                            </div>
                          )}
                          {getComfortFeatures(car).length > 5 && (
                            <div className="text-xs text-gray-500 text-center pt-1">
                              +{getComfortFeatures(car).length - 5} more features
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonModal;