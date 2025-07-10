// components/HeroSection.tsx
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CarSearchInput from '../components/CarSearchInput';
import SellCarButton from './sell-car';

const HeroSection = () => {
    const router = useRouter();

    const handleSearch = (query: string) => {
        // Handle search logic here
        console.log('Searching for cars:', query);
        
        // Navigate to cars page with search query
        if (query.trim()) {
            // Encode the search query for URL
            const encodedQuery = encodeURIComponent(query.trim());
            router.push(`/cars?search=${encodedQuery}`);
        } else {
            // If empty search, just navigate to cars page
            router.push('/cars');
        }
    };

    return (
        <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-start -mt-[80px] pt-[80px]">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero_image.webp"
                    alt="Happy family"
                    className="h-full w-full object-cover"
                    fill
                    priority
                />
                {/* Dark overlay for better text readability on mobile */}
                <div className="absolute inset-0 bg-black/30 sm:bg-black/20"></div>
            </div>

            {/* Content overlay */}
            <div className="relative z-10 px-4 sm:px-6 md:px-12 w-full max-w-7xl mx-auto">
                <div className="max-w-2xl">
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
                        Fast and Easy way
                    </h1>
                    <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 leading-tight'>
                        to buy or sell cars  🇰🇪
                    </h1>

                    {/* Search Input */}
                    <div className="mt-6 sm:mt-8 flex flex-col gap-4 sm:gap-6">
                        <div className="w-full">
                            <CarSearchInput
                                onSearch={handleSearch}
                                placeholder="Search your desired car"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <SellCarButton
                                onClick={() => {
                                    // Handle sell car action
                                    // e.g., navigate to sell car page
                                    router.push('/sell-car');
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection