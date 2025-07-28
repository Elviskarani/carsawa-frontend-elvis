// app/components/UserListingsGrid.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Trash2, AlertCircle, Loader2, Car as CarIcon } from 'lucide-react';
import { getMyCarListings, deleteUserCar, type Car } from '../services/api';

const UserListingsGrid: React.FC = () => {
  const [listings, setListings] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch user listings...');
      const response = await getMyCarListings();
      console.log('Response received:', response);
      setListings(response.cars);
    } catch (error: any) {
      console.error('Error fetching user listings:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setError(`Failed to load your listings: ${error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (carId: string) => {
    try {
      setDeleteLoading(carId);
      await deleteUserCar(carId);
      
      // Remove the deleted car from the listings
      setListings(prevListings => prevListings.filter(car => car._id !== carId));
      setShowDeleteModal(null);
      
      // Show success message (you could add a toast notification here)
      console.log('Car deleted successfully');
    } catch (error: any) {
      console.error('Error deleting car:', error);
      setError('Failed to delete car. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchUserListings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <CarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">You haven't listed any cars yet</p>
        <a
          href="/sell"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          List Your First Car
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((car) => (
          <div
            key={car._id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Car Image */}
            <div className="relative h-48 bg-gray-200">
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CarIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(car.status)}`}>
                  {car.status}
                </span>
              </div>
            </div>

            {/* Car Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {car.make} {car.model}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Year:</span>
                  <span className="font-medium">{car.year}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Mileage:</span>
                  <span className="font-medium">{car.mileage?.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Price:</span>
                  <span className="font-medium text-blue-600">{formatPrice(car.price)}</span>
                </div>
              </div>

              {/* Date Listed */}
              {car.createdAt && (
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar className="w-3 h-3 mr-1" />
                  Listed on {formatDate(car.createdAt)}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href={`/cars/${car._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View
                </a>
                <button
                  onClick={() => setShowDeleteModal(car._id || '')}
                  disabled={deleteLoading === car._id}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading === car._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Listing</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this car listing? This will permanently remove it from the platform.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteLoading === showDeleteModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading === showDeleteModal ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deleteLoading === showDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserListingsGrid;