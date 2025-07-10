"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { getDealerById, getCarsByDealer, Dealer, PaginatedCarResponse } from '@/app/services/api';
import CarCard from "@/app/components/carcard";
import { FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import GoogleMap from '@/app/components/googlemapcomponent';

// Default image paths
const DEFAULT_DEALER_IMAGE = '/images/default-dealer.jpg';
// Default coordinates (Nairobi) in case dealer coordinates are missing
const DEFAULT_COORDINATES = { lat: -1.2921, lng: 36.8219 };

export default function DealerDetailPage() {
  const params = useParams();
  const dealerId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [dealerCarsResponse, setDealerCarsResponse] = useState<PaginatedCarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carsCurrentPage, setCarsCurrentPage] = useState(1);
  const carsPerPage = 8;

  const fetchDealerData = useCallback(async (page: number) => {
    if (!dealerId) {
      setError("Dealer ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let currentDealer = dealer;
      if (!currentDealer) {
        currentDealer = await getDealerById(dealerId);
        setDealer(currentDealer);
      }

      const carsData = await getCarsByDealer(dealerId, {
        page: page,
        pageSize: carsPerPage,
      });

      setDealerCarsResponse(carsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dealer details or cars:', err);
      if (err.message && err.message.toLowerCase().includes('not found')) {
        notFound();
        return;
      }
      setError(err.message || 'Failed to load dealer information. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dealerId, dealer, carsPerPage]);

  useEffect(() => {
    if (dealerId) {
      fetchDealerData(carsCurrentPage);
    } else if (!dealerId && typeof params.id !== 'undefined') {
      setError("Invalid Dealer ID in URL.");
      setLoading(false);
    }
  }, [dealerId, carsCurrentPage, fetchDealerData]);

  const handleCarsPageChange = (newPage: number) => {
    if (newPage > 0 && dealerCarsResponse && newPage <= dealerCarsResponse.pages) {
      setCarsCurrentPage(newPage);
    }
  };

  // Function to handle get directions
  const handleGetDirections = () => {
    if (dealer?.location) {
      const { latitude, longitude } = dealer.location;
      // Open Google Maps with directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  // Get dealer coordinates with fallback
  const getDealerCoordinates = () => {
    if (dealer?.location?.latitude && dealer?.location?.longitude) {
      return {
        lat: dealer.location.latitude,
        lng: dealer.location.longitude
      };
    }
    return DEFAULT_COORDINATES;
  };

  if (loading && !dealer && !dealerCarsResponse) {
    return (
      <div className="bg-whitesmoke w-full min-h-screen">
        <div className="flex items-center w-full px-4 py-4 bg-[#272D3C] mb-7">
          <Link href="/dealers" className="inline-flex items-center text-white hover:underline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Dealers
          </Link>
        </div>
        <div className="container mx-auto flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#c1ff72] border-t-[#272D3C] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dealer information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-whitesmoke w-full min-h-screen">
        <div className="flex items-center w-full px-4 py-4 bg-[#272D3C] mb-7">
          <Link href="/dealers" className="inline-flex items-center text-white hover:underline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Dealers
          </Link>
        </div>
        <div className="container mx-auto flex justify-center items-center py-20">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700">{error}</p>
            <Link href="/dealers"
              className="mt-4 px-4 py-2 bg-[#272D3C] text-white rounded-lg hover:bg-[#1a1a1a] transition"
            >
              Go to Dealers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="bg-whitesmoke w-full min-h-screen">
        <div className="flex items-center w-full px-4 py-4 bg-[#272D3C] mb-7">
          <Link href="/dealers" className="inline-flex items-center text-white hover:underline">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Dealers
          </Link>
        </div>
        <div className="container mx-auto flex justify-center items-center py-20">
          <p className="text-gray-700 text-xl">Dealer information could not be loaded.</p>
        </div>
      </div>
    );
  }

  const carsToDisplay = dealerCarsResponse?.cars || [];
  const totalCarsFound = dealerCarsResponse?.total || 0;
  const totalCarPages = dealerCarsResponse?.pages || 0;
  const dealerCoordinates = getDealerCoordinates();

  return (
    <div className="bg-whitesmoke w-full">
      <div className="flex items-center w-full px-4 py-4 bg-[#272D3C] mb-7">
        <Link href="/dealers" className="inline-flex items-center text-white hover:underline">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Dealers
        </Link>
      </div>

      <div className="container mx-auto">
        {/* Hero Image and Name */}
        <div className="flex px-4 items-center mb-7">
          <div className="relative">
            <Image
              src={dealer.profileImage || DEFAULT_DEALER_IMAGE}
              alt={`${dealer.name} dealership`}
              width={70}
              height={70}
              priority
              className="w-[70px] h-[70px] object-cover shadow-lg bg-white rounded-full border border-gray-200"
            />
          </div>
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-3xl font-bold text-gray-800">{dealer.name}</h1>
              <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Seller
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{dealer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaWhatsapp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="font-medium text-gray-900">{dealer.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section with Map */}
        <div className="px-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                Location
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {dealer.location?.address || "Address not specified"}
              </p>
              {dealer.location?.latitude && dealer.location?.longitude && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {dealer.location.latitude.toFixed(6)}, {dealer.location.longitude.toFixed(6)}
                </p>
              )}
            </div>

            {/* Map Container */}
            <div className="relative h-64 bg-gray-200">
              <GoogleMap
                center={dealerCoordinates}
                zoom={15}
                dealer={dealer}
              />

              {/* Location Pin Overlay */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs z-10">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{dealer.name}</h3>
                    <p className="text-xs text-gray-600">{dealer.location?.address || "Address not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Directions Button */}
            <div className="p-4">
              <button 
                onClick={handleGetDirections}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Get Directions
              </button>
            </div>
          </div>
        </div>

        {/* Dealer Cars Section */}
        <div className="px-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-2">
            <h2 className="font-semibold text-2xl text-gray-800">Available Cars ({totalCarsFound})</h2>
            {loading && dealerCarsResponse && <p className="text-sm text-gray-600">Loading cars...</p>}
          </div>

          {carsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {carsToDisplay.map((car) => (
                <CarCard
                  key={car._id || car.id}
                  id={car._id || car.id}
                  make={car.make}
                  model={car.model}
                  price={car.price}
                  year={car.year}
                  mileage={car.mileage}
                  transmission={car.transmission}
                  fuelType={car.fuelType}
                  engineSize={car.engineSize}
                  status={car.status === 'Available' ? 'Available' : car.status}
                  images={car.images} 
                  bodyType={car.bodyType || ''}
                />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500">No cars currently available from this dealer.</p>
              </div>
            )
          )}

          {/* Pagination for Dealer's Cars */}
          {totalCarPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8 mb-12">
              <button
                onClick={() => handleCarsPageChange(carsCurrentPage - 1)}
                disabled={carsCurrentPage === 1 || loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {carsCurrentPage} of {totalCarPages}
              </span>
              <button
                onClick={() => handleCarsPageChange(carsCurrentPage + 1)}
                disabled={carsCurrentPage === totalCarPages || loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}