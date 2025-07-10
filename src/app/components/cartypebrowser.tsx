"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CarTypeBrowser = () => {
  const router = useRouter();

  const BODY_TYPES = [
    { type: 'SUV', image: '/suv-dc743039.svg', displayName: 'SUVs' },
    { type: 'Hatchback', image: '/hatchback-235fe02d.svg', displayName: 'Hatchbacks' },
    { type: 'Sedan', image: '/saloon-b8d4b50e.svg', displayName: 'Saloons' },
    { type: 'Coupe', image: '/coupe-b6bef833.svg', displayName: 'Coupes' },
    { type: 'Wagon', image: '/estate-f29bd84f.svg', displayName: 'Estate cars' },
    { type: 'Van', image: '/people_carrier-d75a44fc.svg', displayName: 'People carriers' },
    { type: 'Sports', image: '/sports_car-8604921b.svg', displayName: 'Sports cars' },
    { type: 'Convertible', image: '/convertible-71f66687.svg', displayName: 'Convertibles' },
  ];

  const handleTypeSelect = (type: string) => {
    router.push(`/cars?type=${type}`);
  };

  return (
    <div className="bg-white px-4 md:px-8 lg:px-96 xl:px-[20rem] 2xl:px-[25rem] py-6">
      <h2 className="text-xl text-gray-800 font-bold mb-4 text-center">Browse by car type</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
        {BODY_TYPES.map((car) => (
          <button
            key={car.type}
            onClick={() => handleTypeSelect(car.type)}
            className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center  transition-all duration-300 transform hover:border-[#272D3C] border-2 border-transparent"
          >
            <div className="w-10 h-10 relative mb-2">
              <Image
                src={car.image}
                alt={car.displayName}
                width={50}
                height={50}
              />
            </div>
            <span className="text-center text-gray-800 text-sm">{car.displayName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarTypeBrowser;