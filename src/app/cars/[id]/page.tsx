"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ImageCarousel from "@/app/components/imagecarousel";
import CarDetailsPage from "@/app/components/cardata"; // Your component for car data display
import { getCarById, type Car, getDealerById, type Dealer } from "@/app/services/api";

export default function CarDetailsPageWrapper() {
  const params = useParams();

  // Extract the 'id' from params. It can be a string or string[].
  const idFromParams = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  const [car, setCar] = useState<Car | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>(''); // For debugging

  useEffect(() => {
    if (!idFromParams) {
      setError("Car ID is missing or invalid.");
      setLoading(false);
      return;
    }

    const fetchCarDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching car with ID: ${idFromParams}`);
        const carData = await getCarById(idFromParams);
        
        if (!carData) {
          setError(`Car with ID ${idFromParams} not found.`);
          setCar(null);
        } else {
          setCar(carData);
          setDebugInfo(`Car data loaded. Dealer reference: ${JSON.stringify(carData.dealer)}`);
          
          // Enhanced dealer fetching logic with better logging
          if (carData.dealer) {
            let dealerId: string;
            
            // Handle the case where dealer could be an object or string
            if (typeof carData.dealer === 'string') {
              dealerId = carData.dealer.trim();
              setDebugInfo(prev => `${prev}\nDealer ID (string): "${dealerId}"`);
            } else if (typeof carData.dealer === 'object' && carData.dealer !== null) {
              // If dealer is an object with _id or id property
              dealerId = (carData.dealer._id || carData.dealer.id || '').toString().trim();
              setDebugInfo(prev => `${prev}\nDealer ID (from object): "${dealerId}"`);
            } else {
              setDebugInfo(prev => `${prev}\nUnable to extract dealer ID, type: ${typeof carData.dealer}`);
              return;
            }
            
            if (dealerId) {
              try {
                console.log(`Fetching dealer with ID: ${dealerId}`);
                const dealerData = await getDealerById(dealerId);
                setDealer(dealerData);
                setDebugInfo(prev => `${prev}\nDealer data loaded: ${JSON.stringify(dealerData)}`);
              } catch (dealerErr) {
                console.error(`Error fetching dealer details for dealer ID "${dealerId}":`, dealerErr);
                setDebugInfo(prev => `${prev}\nError fetching dealer: ${dealerErr}`);
              }
            } else {
              setDebugInfo(prev => `${prev}\nDealer ID was empty after trimming.`);
            }
          } else {
            setDebugInfo(prev => `${prev}\nNo dealer reference found in car data.`);
          }
        }
      } catch (err) {
        console.error("Error fetching car details:", err);
        setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
        
        if (err instanceof Error && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
            setError(`Car with ID ${idFromParams} not found.`);
        } else {
            setError("Failed to load car details. Please try again later.");
        }
        setCar(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [idFromParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#272D3C]"></div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen w-full  bg-gray-50">
        <div className="bg-[#272D3C] text-white py-4">
          <div className="container mx-auto px-4">
            <Link
              href="/cars"
              className="inline-flex items-center text-white hover:underline"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
              Back to Cars
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 inline-block">
            {error || "Car not found."}
          </div>
          <p className="mt-4">
            <Link href="/cars" className="text-blue-600 hover:underline">
              Browse all cars
            </Link>
          </p>
          
          {/* Display debug info in development */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="font-bold mb-2">Debug Info:</h3>
              <pre className="whitespace-pre-wrap text-xs">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If car data is available, render the details
  const carImages = car.images && car.images.length > 0 ? car.images : ["/placeholder-image.webp"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#272D3C] text-white py-4">
        <div className="container mx-auto px-4">
          <Link
            href="/cars"
            className="inline-flex items-center text-white hover:text-[#c1ff72] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cars
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          {`${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || "Car Details"}
        </h1>
        
        {/* Single column layout with Image Carousel on top */}
        <div className="space-y-8 ">
          {/* Image Carousel */}
          <div className="w-full  lg:px-52">
            <ImageCarousel images={carImages} />
          </div>
          
          {/* Car Details Section */}
          <div className="w-full lg:px-52 ">
            <CarDetailsPage 
              car={car} 
              dealer={dealer} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}