"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CarManufacturerBrowser = () => {
  const router = useRouter();

  const make = [
    { name: 'Audi', logo: '/audi.webp' },
    { name: 'BMW', logo: '/bmw.webp' },
    { name: 'Ford', logo: '/ford.webp' },
    { name: 'Honda', logo: '/honda.webp' },
    { name: 'Hyundai', logo: '/hyundai.webp' },
    { name: 'Subaru', logo: '/subaru.webp' },
    { name: 'Mazda', logo: '/mazda.webp' },
    { name: 'Mercedes-Benz', logo: '/mercedes.webp' },
    { name: 'Nissan', logo: '/nissan.webp' },
    { name: 'Toyota', logo: '/toyota.webp' },
    { name: 'Volkswagen', logo: '/VW.webp' },
    { name: 'Volvo', logo: '/volvo.webp' },
    { name: 'Land Rover', logo: '/land_rover.webp' },
    { name: 'Lexus', logo: '/lexus.webp' },
    { name: 'Suzuki', logo: '/suzuki.webp' },
    { name: 'Porsche', logo: '/porsche.webp' },
    { name: 'Rolls Royce', logo: '/Rolls.webp' },
    { name: 'Jaguar', logo: '/jaguar.webp' },
  ];

  const handleManufacturerSelect = (manufacturer: string) => {
    // Changed from 'manufacturer' to 'brand' to match the cars page filter parameter
    router.push(`/cars?make=${manufacturer}`);
  };

  return (
    <div className="bg-whitesmoke px-4 md:px-8 lg:px-96 xl:px-[20rem] 2xl:px-[25rem] py-6">
      <h2 className="text-xl text-gray-800 font-bold mb-4 text-center">Browse by manufacturer</h2>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {make.map((make) => (
          <button
            key={make.name}
            onClick={() => handleManufacturerSelect(make.name)}
            className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center hover:shadow-xl transition-all duration-300 transform hover:border-[#272D3C] border-2 border-transparent"
          >
            <div className="w-10 h-10 relative mb-2">
              <Image
                src={make.logo}
                alt={make.name}
                width={40}
                height={40}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="text-center text-gray-800 text-sm">{make.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CarManufacturerBrowser;