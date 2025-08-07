"use client";

import React, { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { getAllCars, type Car } from "@/app/services/api";
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import CarFilterComponent, { type Filters } from "../components/CarFilterComponent";
import ComparisonModal from "../components/ComparisonModal";
import { ArrowLeftRight } from "lucide-react";

const CarCard = dynamic(() => import("@/app/components/carcard"), {
  loading: () => <div className="bg-white rounded-xl h-80 animate-pulse"></div>,
});

const CARS_PER_PAGE = 9;
const MAX_COMPARE_CARS = 4;

// Utility function to shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Advanced shuffle that ensures fair distribution across dealers/users
const fairShuffle = (cars: Car[]): Car[] => {
  // Group cars by lister (dealer or user)
  const carsByLister = cars.reduce((acc, car) => {
    let listerKey: string;
    
    if (typeof car.dealer === 'string') {
      listerKey = car.dealer;
    } else if (car.dealer && typeof car.dealer === 'object' && 'id' in car.dealer) {
      listerKey = (car.dealer as any)._id || (car.dealer as any).id || 'unknown';
    } else if (typeof car.user === 'string') {
      listerKey = car.user;
    } else if (car.user && typeof car.user === 'object' && 'id' in car.user) {
      listerKey = (car.user as any)._id || (car.user as any).id || 'unknown';
    } else {
      listerKey = 'unknown';
    }
    
    if (!acc[listerKey]) {
      acc[listerKey] = [];
    }
    acc[listerKey].push(car);
    return acc;
  }, {} as Record<string, Car[]>);

  // Shuffle cars within each lister group
  Object.keys(carsByLister).forEach(lister => {
    carsByLister[lister] = shuffleArray(carsByLister[lister]);
  });

  // Interleave cars from different listers for fair distribution
  const listerKeys = Object.keys(carsByLister);
  const shuffledCars: Car[] = [];
  const maxCarsPerLister = Math.max(...Object.values(carsByLister).map(cars => cars.length));

  for (let i = 0; i < maxCarsPerLister; i++) {
    // Shuffle lister order for each round to ensure fairness
    const shuffledListers = shuffleArray(listerKeys);
    
    shuffledListers.forEach(lister => {
      if (carsByLister[lister][i]) {
        shuffledCars.push(carsByLister[lister][i]);
      }
    });
  }

  return shuffledCars;
};

function CarsContent() {
  const [cars, setCars] = useState<Car[]>([]);
  const [allCars, setAllCars] = useState<Car[]>([]); // Store all cars for client-side filtering
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Comparison state
  const [compareList, setCompareList] = useState<Car[]>([]);
  const [showCompareNotification, setShowCompareNotification] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    brand: '',
    model: '',
    mileage: '',
    price: '',
    bodyType: '',
    fuelType: '',
    color: '',
    transmission: '',
    modelYear: ''
  });
  
  const searchParams = useSearchParams();

  const statusPriority: Record<string, number> = {
    "available": 1,
    "reserved": 2,
    "sold": 3,
  };

  const sortCarsByStatus = (carsToSort: Car[]): Car[] => {
    return [...carsToSort].sort((a, b) => {
      const statusA = a.status ? String(a.status).toLowerCase() : "unknown";
      const statusB = b.status ? String(b.status).toLowerCase() : "unknown";
      const priorityA = statusPriority[statusA] || 99;
      const priorityB = statusPriority[statusB] || 99;
      return priorityA - priorityB;
    });
  };

  // Helper function to get car ID
  const getCarId = (car: Car): string => {
    return car._id || car.id || `${car.make}-${car.model}-${car.year}-${Math.random()}`;
  };

  // Comparison handlers
  const handleAddToCompare = useCallback((car: Car) => {
    const carId = getCarId(car);
    
    setCompareList(prev => {
      // Check if car is already in compare list
      if (prev.some(c => getCarId(c) === carId)) {
        // Remove from compare list
        return prev.filter(c => getCarId(c) !== carId);
      }
      
      // Check if we've reached the maximum
      if (prev.length >= MAX_COMPARE_CARS) {
        setShowCompareNotification(true);
        setTimeout(() => setShowCompareNotification(false), 3000);
        return prev;
      }
      
      // Add to compare list
      return [...prev, car];
    });
  }, []);

  const handleRemoveFromCompare = useCallback((carId: string) => {
    setCompareList(prev => prev.filter(car => getCarId(car) !== carId));
  }, []);

  const handleClearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isCarInCompareList = useCallback((car: Car): boolean => {
    return compareList.some(c => getCarId(c) === getCarId(car));
  }, [compareList]);

  // Initialize filters with URL parameters
  const initialFilters = useMemo(() => {
    const typeParam = searchParams.get('type');
    const makeParam = searchParams.get('make');
    const searchParam = searchParams.get('search');
    const yearParam = searchParams.get('year');
    
    return {
      search: searchParam || '',
      bodyType: typeParam || '',
      brand: makeParam || '',
      modelYear: yearParam || '',
      model: '',
      mileage: '',
      price: '',
      fuelType: '',
      color: '',
      transmission: ''
    };
  }, [searchParams]);

  // Set initial filters when URL parameters change
  useEffect(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, [initialFilters]);

  // CLIENT-SIDE FILTERING AND RANDOMIZATION LOGIC
  const filteredCars = useMemo(() => {
    if (!allCars.length) return [];

    let filtered = allCars.filter(car => {
      // Search filter - searches in make, model, and other relevant fields
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        const carText = `${car.make || ''} ${car.model || ''} ${car.bodyType || ''} ${car.fuelType || ''}`.toLowerCase();
        if (!carText.includes(searchTerm)) return false;
      }

      // Brand filter
      if (filters.brand && car.make !== filters.brand) {
        return false;
      }

      // Model filter
      if (filters.model && car.model !== filters.model) {
        return false;
      }

      // Body type filter
      if (filters.bodyType && car.bodyType !== filters.bodyType) {
        return false;
      }

      // Fuel type filter
      if (filters.fuelType && car.fuelType !== filters.fuelType) {
        return false;
      }

      // Transmission filter
      if (filters.transmission && car.transmission !== filters.transmission) {
        return false;
      }

      // Model year filter
      if (filters.modelYear && car.year && car.year.toString() !== filters.modelYear) {
        return false;
      }

      // Price range filter
      if (filters.price) {
        const priceRange = filters.price.split('-');
        if (priceRange.length === 2) {
          const minPrice = parseInt(priceRange[0]);
          if (priceRange[1] === '+') {
            // Handle "20000000+" case
            if (car.price < minPrice) return false;
          } else {
            const maxPrice = parseInt(priceRange[1]);
            if (car.price < minPrice || car.price > maxPrice) return false;
          }
        }
      }

      // Mileage filter
      if (filters.mileage) {
        const mileageRange = filters.mileage.split('-');
        if (mileageRange.length === 2) {
          const minMileage = parseInt(mileageRange[0]);
          if (mileageRange[1] === '+') {
            // Handle "150000+" case
            if (car.mileage < minMileage) return false;
          } else {
            const maxMileage = parseInt(mileageRange[1]);
            if (car.mileage < minMileage || car.mileage > maxMileage) return false;
          }
        }
      }

      return true;
    });

    // Apply fair randomization after filtering
    return fairShuffle(filtered);
  }, [allCars, filters]);

  // Paginate filtered cars
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * CARS_PER_PAGE;
    const endIndex = startIndex + CARS_PER_PAGE;
    return sortCarsByStatus(filteredCars.slice(startIndex, endIndex));
  }, [filteredCars, currentPage]);

  // Update pagination info when filtered cars change
  useEffect(() => {
    setTotalCars(filteredCars.length);
    setTotalPages(Math.ceil(filteredCars.length / CARS_PER_PAGE));
    
    // Reset to first page if current page exceeds total pages
    const newTotalPages = Math.ceil(filteredCars.length / CARS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCars, currentPage]);

  // Fetch all cars initially (without pagination for client-side filtering)
  const fetchAllCars = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching all cars...');
      // Fetch with a large page size to get all cars
      const response = await getAllCars({ page: 1, pageSize: 1000 });
      const fetchedCars = response.cars || [];
      
      setAllCars(fetchedCars);
      console.log(`Loaded ${fetchedCars.length} cars total`);
    } catch (err: any) {
      console.error("Error fetching cars:", err);
      setAllCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cars when component mounts
  useEffect(() => {
    fetchAllCars();
  }, [fetchAllCars]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Filters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper function to get active filter summary
  const getActiveFilterSummary = () => {
    const activeFilters = [];
    if (filters.search && filters.search.trim()) activeFilters.push(`search: "${filters.search}"`);
    if (filters.brand) activeFilters.push(`brand: ${filters.brand}`);
    if (filters.bodyType) activeFilters.push(`type: ${filters.bodyType}`);
    if (filters.price) activeFilters.push(`price: ${filters.price}`);
    if (filters.mileage) activeFilters.push(`mileage: ${filters.mileage}`);
    if (filters.fuelType) activeFilters.push(`fuel: ${filters.fuelType}`);
    if (filters.transmission) activeFilters.push(`transmission: ${filters.transmission}`);
    if (filters.modelYear) activeFilters.push(`year: ${filters.modelYear}`);
    return activeFilters;
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

    // Modern button styles with improved hover and active states
    const baseButtonClasses = "relative px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:z-10 select-none min-w-[44px] flex items-center justify-center";
    const currentButtonClasses = "z-10 text-white bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600 hover:from-blue-700 hover:to-blue-800 hover:border-blue-700 shadow-lg transform hover:scale-105 focus:ring-blue-400";
    const ellipsisClasses = "px-4 py-2.5 text-sm text-gray-400 bg-white border border-gray-300 cursor-default min-w-[44px] flex items-center justify-center";

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(
        <li key={1} className="transition-transform duration-200 hover:scale-105">
          <button
            onClick={() => paginate(1)}
            className={`${baseButtonClasses} rounded-l-lg`}
            aria-label="Go to page 1"
          >
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <li key="start-ellipsis">
            <span className={ellipsisClasses} aria-label="More pages">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </span>
          </li>
        );
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      const isFirst = i === startPage && startPage === 1;
      const isLast = i === endPage && endPage === totalPages;
      const roundedClasses = isFirst ? 'rounded-l-lg' : isLast ? 'rounded-r-lg' : '';
      
      pageNumbers.push(
        <li key={i} className="transition-transform duration-200 hover:scale-105">
          <button
            onClick={() => paginate(i)}
            className={`${baseButtonClasses} ${roundedClasses} ${currentPage === i ? currentButtonClasses : ''}`}
            aria-current={currentPage === i ? 'page' : undefined}
            aria-label={`Go to page ${i}`}
          >
            {i}
          </button>
        </li>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <li key="end-ellipsis">
            <span className={ellipsisClasses} aria-label="More pages">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </span>
          </li>
        );
      }
      pageNumbers.push(
        <li key={totalPages} className="transition-transform duration-200 hover:scale-105">
          <button
            onClick={() => paginate(totalPages)}
            className={`${baseButtonClasses} rounded-r-lg`}
            aria-label={`Go to page ${totalPages}`}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        {/* Compare notification */}
        {showCompareNotification && (
          <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>You can compare up to {MAX_COMPARE_CARS} cars only!</span>
            </div>
          </div>
        )}

        <CarFilterComponent 
          onFiltersChange={handleFiltersChange}
          initialFilters={initialFilters}
        />

        {/* Comparison Modal */}
        <ComparisonModal
          selectedCars={compareList}
          onRemoveCar={handleRemoveFromCompare}
          onClearAll={handleClearCompare}
        />
        
        {/* Active Filters Display */}
        {getActiveFilterSummary().length > 0 && (
          <div className="text-left lg:px-30 mb-4">
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">Active filters:</span> {getActiveFilterSummary().join(', ')}
            </p>
          </div>
        )}
        
        {/* Cars Found Counter */}
        <div className="text-left lg:px-30 mb-8">
          <p className="text-gray-600 font-bold">
            {loading ? (
              "Loading cars..."
            ) : totalCars === 0 ? (
              <span className="text-red-600">
                No cars found with current filters
              </span>
            ) : (
              `${totalCars} car${totalCars !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>

        {/* Car Cards Grid */}
        <div className="flex justify-center">
          <div className="w-full max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: CARS_PER_PAGE }).map((_, index) => (
                  <div key={`loading-${index}`} className="bg-white rounded-xl h-80 w-full animate-pulse"></div>
                ))}
              </div>
            ) : paginatedCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedCars.map((car) => (
                  <div key={getCarId(car)} className="w-full relative">
                    {/* Compare button overlay */}
                    <div className="absolute top-4 left-4 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCompare(car);
                        }}
                        className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                          isCarInCompareList(car)
                            ? 'bg-[#272d3c] text-white   hover:bg-[#272d3c]'
                            : 'bg-white text-gray-600  hover:bg-gray-50 hover:border-gray-400'
                        }`}
                        title={isCarInCompareList(car) ? 'Remove from comparison' : 'Compare'}
                      >
                        <ArrowLeftRight size={20} />
                      </button>
                    </div>

                    <CarCard
                      {...car}
                      id={getCarId(car)}
                      make={car.make || ""}
                      model={car.model || ""}
                      bodyType={car.bodyType || "N/A"}
                      price={car.price || 0}
                      year={car.year || 0}
                      mileage={car.mileage || 0}
                      images={car.images || []}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.175-5.5-2.709V6a2 2 0 012-2h7a2 2 0 012 2v6.291z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    We couldn't find any cars matching your current filters.
                  </p>
                  <div className="text-gray-400 text-xs space-y-1">
                    <p>Try:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Removing some filters</li>
                      <li>Changing your search terms</li>
                      <li>Expanding your price or mileage range</li>
                      <li>Selecting different brands or body types</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Pagination */}
        {!loading && totalCars > 0 && totalPages > 1 && (
          <div className="flex flex-col items-center mt-12 space-y-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600 font-medium">
              Showing page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span>
              {' '}({totalCars} total cars)
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                aria-label="Previous page"
              >
                <svg className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Page Numbers */}
              <nav aria-label="Pagination" className="hidden sm:block">
                <ul className="flex items-center shadow-sm rounded-lg overflow-hidden border border-gray-300 bg-white">
                  {renderPaginationNumbers()}
                </ul>
              </nav>

              {/* Mobile Page Indicator */}
              <div className="sm:hidden">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                  {currentPage} / {totalPages}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                aria-label="Next page"
              >
                Next
                <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Quick Jump (for many pages) */}
            {totalPages > 10 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Jump to page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => paginate(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  aria-label="Jump to page"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Cars() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse bg-white rounded-xl h-80 w-full max-w-sm"></div>
      </div>
    }>
      <CarsContent />
    </Suspense>
  );
}

export default Cars;