"use client";

import React, { useState, useMemo, useCallback, Suspense, useEffect } from "react";
import { getAllCars, type Car } from "@/app/services/api";
import dynamic from 'next/dynamic';
import { useSearchParams } from "next/navigation";
import CarFilterComponent, { type Filters } from "../components/CarFilterComponent";

const CarCard = dynamic(() => import("@/app/components/carcard"), {
  loading: () => <div className="bg-white rounded-xl h-80 animate-pulse"></div>,
});

const CARS_PER_PAGE = 9;

function CarsContent() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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

  // Initialize filters with URL parameters using useMemo
  const initialFilters = useMemo(() => {
    const typeParam = searchParams.get('type');
    const makeParam = searchParams.get('make');
    const searchParam = searchParams.get('search');
    
    return {
      search: searchParam || '',
      bodyType: typeParam || '',
      brand: makeParam || '',
      model: '',
      mileage: '',
      price: '',
      fuelType: '',
      color: '',
      transmission: '',
      modelYear: ''
    };
  }, [searchParams]);

  // Set initial filters when URL parameters change
  useEffect(() => {
    setFilters(initialFilters);
    setCurrentPage(1); // Reset to first page when URL parameters change
  }, [initialFilters]);

  // Convert filter values to API format
  const convertFiltersToAPI = useCallback((filterValues: Filters): Record<string, string | number> => {
    const apiFilters: Record<string, string | number> = {
      page: currentPage,
      pageSize: CARS_PER_PAGE,
    };

    // Convert filter values to API format
    if (filterValues.search) apiFilters.search = filterValues.search;
    if (filterValues.brand) apiFilters.make = filterValues.brand;
    if (filterValues.model) apiFilters.model = filterValues.model;
    if (filterValues.bodyType) apiFilters.bodyType = filterValues.bodyType;
    if (filterValues.fuelType) apiFilters.fuelType = filterValues.fuelType;
    if (filterValues.transmission) apiFilters.transmission = filterValues.transmission;
    if (filterValues.modelYear) apiFilters.year = filterValues.modelYear;

    // Handle price range
    if (filterValues.price) {
      const priceRange = filterValues.price.split('-');
      if (priceRange.length === 2) {
        apiFilters.minPrice = parseInt(priceRange[0]);
        if (priceRange[1] !== '+') {
          apiFilters.maxPrice = parseInt(priceRange[1]);
        }
      }
    }

    // Handle mileage range
    if (filterValues.mileage) {
      if (filterValues.mileage.includes('+')) {
        apiFilters.minMileage = parseInt(filterValues.mileage.replace('+', ''));
      } else {
        const mileageRange = filterValues.mileage.split('-');
        if (mileageRange.length === 2) {
          apiFilters.minMileage = parseInt(mileageRange[0]);
          apiFilters.maxMileage = parseInt(mileageRange[1]);
        }
      }
    }

    return apiFilters;
  }, [currentPage, filters]);

  // Memoize API filters to optimize performance
  const apiFilters = useMemo(() => convertFiltersToAPI(filters), [filters, convertFiltersToAPI]);

  // Fetch cars function
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching cars with filters:', apiFilters);
      const response = await getAllCars(apiFilters);
      const fetchedCars = response.cars || [];
      
      setTotalCars(response.total || 0);
      setTotalPages(response.pages || 1);
      setCars(sortCarsByStatus(fetchedCars));

      if (currentPage > (response.pages || 1) && (response.pages || 1) > 0) {
        setCurrentPage(response.pages || 1);
      }
    } catch (err: any) {
      console.error("Error fetching cars:", err);
      setCars([]);
      setTotalCars(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [apiFilters, currentPage]);

  // Fetch cars when the component mounts or filters change
  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Handle filter changes from the filter component
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
    if (filters.search) activeFilters.push(`search: "${filters.search}"`);
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

    if (startPage > 1) {
      pageNumbers.push(
        <li key={1}>
          <button onClick={() => paginate(1)} className="pagination-button">1</button>
        </li>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <li key="start-ellipsis">
            <span className="pagination-ellipsis">...</span>
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i}>
          <button
            onClick={() => paginate(i)}
            className={`pagination-button ${currentPage === i ? 'pagination-button-current' : ''}`}
            aria-current={currentPage === i ? 'page' : undefined}
          >
            {i}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <li key="end-ellipsis">
            <span className="pagination-ellipsis">...</span>
          </li>
        );
      }
      pageNumbers.push(
        <li key={totalPages}>
          <button onClick={() => paginate(totalPages)} className="pagination-button">
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
        <CarFilterComponent 
          onFiltersChange={handleFiltersChange}
          initialFilters={initialFilters}
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
              "Searching cars..."
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
            ) : cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div key={car._id || car.id || `${car.make}-${car.model}-${car.year}-${Math.random()}`} className="w-full">
                    <CarCard
                      {...car}
                      id={car._id || car.id || `${car.make}-${car.model}-${car.year}-${Math.random()}`}
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

        {/* Pagination */}
        {!loading && totalCars > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <nav aria-label="Pagination">
              <ul className="inline-flex items-center -space-x-px shadow-sm rounded-md">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button rounded-l-md"
                    aria-label="Previous page"
                  >
                    Previous
                  </button>
                </li>
                {renderPaginationNumbers()}
                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button rounded-r-md"
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <style jsx global>{`
        .pagination-button {
          @apply px-4 py-2 h-10 leading-tight text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
        }
        .pagination-button-current {
          @apply z-10 text-blue-600 bg-blue-50 border-blue-300 hover:bg-blue-100 hover:text-blue-700;
        }
        .pagination-ellipsis {
          @apply px-4 py-2 h-10 leading-tight text-gray-500 bg-white border border-gray-300;
        }
      `}</style>
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