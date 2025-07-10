"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { getUserFavorites, removeFavorite, getFavoriteCount, isAuthenticated } from '@/app/services/api';
import type { UserFavoritesResponse, Car } from '@/app/services/api';
import CarCard from './carcard';

const FavoritesGrid: React.FC = () => {
  const [favorites, setFavorites] = useState<Array<{
    _id: string;
    user: string;
    car: Car;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ITEMS_PER_PAGE = 9;

  const fetchFavorites = async (page: number = 1) => {
    try {
      setLoading(page === 1);
      setError(null);

      if (!isAuthenticated()) {
        setError('Please log in to view your favorites');
        return;
      }

      const response = await getUserFavorites(page, ITEMS_PER_PAGE);
      
      setFavorites(response.favorites);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setError(error.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFavorites(currentPage);
  };

  const handleRemoveFavorite = async (carId: string) => {
    try {
      await removeFavorite(carId);
      
      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.car._id !== carId));
      setTotalItems(prev => prev - 1);
      
      // If this was the last item on the page and we're not on page 1, go to previous page
      if (favorites.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Otherwise, refresh the current page
        await fetchFavorites(currentPage);
      }
      
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite. Please try again.');
    }
  };

  const handleFavoriteChange = (carId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      // If unfavorited, remove from the list
      setFavorites(prev => prev.filter(fav => fav.car._id !== carId));
      setTotalItems(prev => prev - 1);
    }
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage <= halfPagesToShow) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfPagesToShow >= totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i}>
          <button
            onClick={() => paginate(i)}
            className={`px-3 py-2 text-sm leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
              currentPage === i ? 'z-10 text-blue-600 bg-blue-50 border-blue-300' : ''
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorite cars yet</h3>
        <p className="text-gray-600 mb-6">Start browsing cars and add them to your favorites!</p>
        <a
          href="/cars"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Cars
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Favorites</h2>
          <p className="text-sm text-gray-600">
            {totalItems} {totalItems === 1 ? 'car' : 'cars'} in your favorites
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <div key={favorite._id} className="relative">
            <CarCard
              id={favorite.car._id}
              make={favorite.car.make}
              model={favorite.car.model}
              bodyType={favorite.car.bodyType}
              price={favorite.car.price}
              year={favorite.car.year}
              mileage={favorite.car.mileage}
              transmission={favorite.car.transmission}
              fuelType={favorite.car.fuelType}
              engineSize={favorite.car.engineSize}
              status={favorite.car.status}
              images={favorite.car.images}
              onFavoriteChange={handleFavoriteChange}
            />
            
            {/* Quick Remove Button */}
            <button
              onClick={() => handleRemoveFavorite(favorite.car._id!)}
              className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
              aria-label="Remove from favorites"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav aria-label="Pagination">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
              </li>
              {renderPaginationNumbers()}
              <li>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default FavoritesGrid;