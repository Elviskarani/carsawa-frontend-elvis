"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DealerCard from '@/app/components/DealerCard'; // Ensure this component exists and props match
import { getAllDealers, Dealer, PaginatedDealerResponse } from '@/app/services/api';

// This interface defines the props expected by your DealerCard component
interface FormattedDealerForCard {
  _id: string; // Using _id for React key
  dealerImageSrc: string;
  dealershipName: string;
  location: string;
  dealershipPageUrl: string;
  // verified?: boolean; // Include if you add this feature and pass it to DealerCard
}

// Helper function to validate and format image URLs
function getValidImageUrl(imageUrl: string | null | undefined): string {
  const defaultImage = '/images/default-dealer.jpg';
  
  if (!imageUrl || typeof imageUrl !== 'string') {
    return defaultImage;
  }
  
  // Remove any whitespace
  const trimmedUrl = imageUrl.trim();
  
  // Check if it's already a valid absolute URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    try {
      new URL(trimmedUrl); // This will throw if URL is invalid
      return trimmedUrl;
    } catch {
      return defaultImage;
    }
  }
  
  // Check if it's a valid relative path (starts with /)
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }
  
  // If it's just a filename or invalid string, return default
  if (trimmedUrl.length > 0 && !trimmedUrl.includes(' ')) {
    // Assume it's a filename and prepend with your images directory
    return `/images/dealers/${trimmedUrl}`;
  }
  
  return defaultImage;
}



// Helper function to format location from dealer object - returns only the address
function formatDealerLocation(dealer: Dealer): string {
  if (dealer.location && typeof dealer.location === 'object' && dealer.location.address) {
    return dealer.location.address; // Only return the address, not coordinates
  }
  return ''; // Return empty string when no address is available
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<FormattedDealerForCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDealers, setTotalDealers] = useState(0);
  const dealersPerPage = 6; // Or your preferred default page size

  const fetchDealers = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    setError(null);
    try {
      const data: PaginatedDealerResponse = await getAllDealers({
        page: pageToFetch,
        pageSize: dealersPerPage,
      });

      const formattedDealers: FormattedDealerForCard[] = data.dealers.map((dealer: Dealer) => {
        // Debug log to see the actual dealer data structure
        console.log('Dealer data:', dealer);
        console.log('Dealer location:', dealer.location);
        
        return {
          _id: dealer._id,
          dealerImageSrc: getValidImageUrl(dealer.profileImage), // Use the helper function
          dealershipName: dealer.name,
          location: formatDealerLocation(dealer), // Use the helper function to format location
          // Use dealer.id if your backend Mongoose transform provides it, otherwise fallback to dealer._id
          dealershipPageUrl: `/dealers/${dealer.id || dealer._id}`,
          // verified: dealer.verified, // Add if 'verified' is part of the Dealer type and used by DealerCard
        };
      });

      setDealers(formattedDealers);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalDealers(data.total);
    } catch (err: any) {
      console.error('Failed to fetch dealers:', err);
      setError(err || 'Failed to load dealers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dealersPerPage]); // dealersPerPage is a dependency

  useEffect(() => {
    fetchDealers(currentPage);
  }, [currentPage, fetchDealers]);

  const handlePaginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && dealers.length === 0) { // Full page loader for initial load
    return (
      <div className="w-full bg-whitesmoke text-gray-800 py-12 px-8">
        <div className="container mx-auto flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#c1ff72] border-t-[#272D3C] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dealers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && dealers.length === 0) { // Full page error if initial load fails
    return (
      <div className="w-full bg-whitesmoke text-gray-800 py-12 px-8">
        <div className="container mx-auto flex justify-center items-center min-h-[60vh]">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => fetchDealers(1)} // Retry fetching the first page
              className="mt-4 px-4 py-2 bg-[#272D3C] text-white rounded-lg hover:bg-[#1a1a1a] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const indexOfFirstDealerDisplay = totalDealers > 0 ? (currentPage - 1) * dealersPerPage + 1 : 0;
  const indexOfLastDealerDisplay = totalDealers > 0 ? Math.min(currentPage * dealersPerPage, totalDealers) : 0;

  return (
    <div className="w-full bg-whitesmoke text-gray-800 py-5 px-4 md:py-12 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-xl md:text-4xl font-bold mb-2 text-gray-800">All Dealers</h1>
        <p className="text-sm text-gray-700 mb-8 max-w-3xl">
          Browse all our partnered dealerships in your area. Find the perfect CarSawa partner dealership that offers exceptional service and the best selection of vehicles.
        </p>

        {/* Results count and inline error/loading for subsequent actions */}
        <div className="mb-6 flex justify-between items-center">
          {totalDealers > 0 && (
            <p className="text-[#272D3C] font-medium">
              Showing {indexOfFirstDealerDisplay}-{indexOfLastDealerDisplay} of {totalDealers} dealers
            </p>
          )}
          {loading && dealers.length > 0 && ( // Inline loader for page changes
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-5 h-5 border-2 border-[#c1ff72] border-t-[#272D3C] rounded-full animate-spin mr-2"></div>
              Loading...
            </div>
          )}
          {error && dealers.length > 0 && ( // Inline error for page changes
             <p className="text-red-500 text-sm">Error: {error}. <button onClick={() => fetchDealers(currentPage)} className="underline">Retry</button></p>
          )}
        </div>

        <div className="grid grid-cols-1 px-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.length > 0 ? (
            dealers.map((dealer) => (
              <DealerCard
                key={dealer._id}
                dealerImageSrc={dealer.dealerImageSrc}
                dealershipName={dealer.dealershipName}
                location={dealer.location}
                dealershipPageUrl={dealer.dealershipPageUrl}
                // verified={dealer.verified} // Pass if using
              />
            ))
          ) : (
            !loading && ( // Show only if not loading and no dealers
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No dealers found.</p>
              </div>
            )
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePaginate(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1 || loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#272D3C] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Previous
              </button>

              {/* Dynamic Page Numbers Logic */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // Simple filter for demonstration, can be made more complex for many pages
                .filter(pageNumber => {
                    if (totalPages <= 5) return true; // Show all if 5 or less
                    if (pageNumber === 1 || pageNumber === totalPages) return true; // Always show first and last
                    if (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) return true; // Show current and neighbors
                    // Add ellipsis placeholders if needed for larger totalPages
                    if ((pageNumber === currentPage - 2 && currentPage -2 > 1) || (pageNumber === currentPage + 2 && currentPage + 2 < totalPages)) return true; // for ellipsis indicators
                    return false;
                })
                .map((pageNumber, index, arr) => {
                    const isEllipsisPrev = index > 0 && pageNumber - arr[index-1] > 1 && (pageNumber === currentPage + 2 && currentPage + 2 < totalPages && currentPage -1 > 1);
                    const isEllipsisNext = index < arr.length -1 && arr[index+1] - pageNumber > 1 && (pageNumber === currentPage - 2 && currentPage -2 > 1 && currentPage +1 < totalPages) ;

                    return (
                        <React.Fragment key={pageNumber}>
                        {isEllipsisPrev && <span className="px-4 py-2 self-end">...</span> }
                        <button
                            onClick={() => handlePaginate(pageNumber)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg ${
                            currentPage === pageNumber
                                ? "bg-[#c1ff72] text-[#272D3C] font-bold"
                                : "bg-gray-200 hover:bg-gray-300"
                            } ${loading ? "cursor-not-allowed" : ""}`}
                        >
                            {pageNumber}
                        </button>
                        {isEllipsisNext && <span className="px-4 py-2 self-end">...</span>}
                        </React.Fragment>
                    );
                })}

              <button
                onClick={() => handlePaginate(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages || loading
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#272D3C] text-white hover:bg-[#1a1a1a]"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}