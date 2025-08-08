import Link from "next/link";
import { Metadata } from 'next';
import ImageCarousel from "@/app/components/imagecarousel";
import CarDetailsPage from "@/app/components/cardata";
import { getCarById, type Car, getDealerById, type Dealer, getUserById, type User } from "@/app/services/api";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const carId = resolvedParams.id;
    
    if (!carId) {
      return {
        title: 'Car Not Found | Carsawa Africa',
        description: 'The requested car listing could not be found. Browse our selection of quality used cars for sale in Kenya.',
      };
    }

    const car = await getCarById(carId);
    
    if (!car) {
      return {
        title: 'Car Not Found | Carsawa Africa',
        description: 'The requested car listing could not be found. Browse our selection of quality used cars for sale in Kenya.',
      };
    }

    const carTitle = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
    const title = carTitle 
      ? `${carTitle} for Sale in Kenya | Carsawa Africa`
      : 'Quality Used Car for Sale in Kenya | Carsawa Africa';

    const formattedPrice = car.price 
      ? new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(car.price)
      : 'competitive price';

    const description = car.make && car.model 
      ? `Find a quality used ${car.make} ${car.model}${car.year ? ` ${car.year}` : ''} for sale at ${formattedPrice} in Kenya. Inspected and verified by Carsawa Africa. Book a test drive or pre-purchase inspection today!`
      : `Find quality used cars for sale at competitive prices in Kenya. Inspected and verified by Carsawa Africa. Book a test drive or pre-purchase inspection today!`;

    const keywords = [
      'used cars Kenya',
      'cars for sale Kenya',
      'buy car Kenya',
      car.make && `${car.make} Kenya`,
      car.model && `${car.model} Kenya`,
      car.year && `${car.year} cars Kenya`,
      'Carsawa Africa',
      'pre-purchase inspection Kenya',
      'verified cars Kenya'
    ].filter(Boolean).join(', ');

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_KE',
        url: `https://carsawa.africa/cars/${carId}`,
        siteName: 'Carsawa Africa',
        images: car.images && car.images.length > 0 
          ? [{
              url: car.images[0],
              width: 1200,
              height: 630,
              alt: `${carTitle} - Carsawa Africa`,
            }]
          : [{
              url: '/carsawa.png',
              width: 1200,
              height: 630,
              alt: 'Carsawa Africa - Quality Used Cars',
            }]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: car.images && car.images.length > 0 ? [car.images[0]] : ['/og-default-car.jpg'],
      },
      alternates: {
        canonical: `https://carsawa.africa/cars/${carId}`,
      },
      robots: {
        index: car.status === 'Available' ? true : false,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    return {
      title: 'Quality Used Cars for Sale in Kenya | Carsawa Africa',
      description: 'Find quality used cars for sale at competitive prices in Kenya. Inspected and verified by Carsawa Africa. Book a test drive or pre-purchase inspection today!',
      keywords: 'used cars Kenya, cars for sale Kenya, buy car Kenya, Carsawa Africa',
    };
  }
}

// Main page component (Server Component)
export default async function CarDetailsPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = resolvedParams.id;

  let car: Car | null = null;
  let dealer: Dealer | null = null;
  let user: User | null = null;
  let error: string | null = null;

  try {
    car = await getCarById(carId);
    
    if (!car) {
      error = `Car with ID ${carId} not found.`;
    } else {
      // Infer listerType if it's missing (for backward compatibility)
      const inferredListerType = car.listerType || (car.dealer ? 'dealer' : car.user ? 'user' : null);
      
      // Check if this is a dealer-listed car
      if ((inferredListerType === 'dealer') && car.dealer) {
        let dealerId: string;
        
        if (typeof car.dealer === 'string') {
          dealerId = car.dealer.trim();
        } else if (typeof car.dealer === 'object' && car.dealer !== null) {
          dealerId = (car.dealer._id || car.dealer.id || '').toString().trim();
        } else {
          dealerId = '';
        }
        
        if (dealerId) {
          try {
            dealer = await getDealerById(dealerId);
          } catch (dealerErr) {
            console.error(`Error fetching dealer details for dealer ID "${dealerId}":`, dealerErr);
          }
        }
      }
      
      // Check if this is a user-listed car
      else if ((inferredListerType === 'user') && car.user) {
        let userId: string;
        
        if (typeof car.user === 'string') {
          userId = car.user.trim();
        } else if (typeof car.user === 'object' && car.user !== null) {
          userId = (car.user._id || car.user.id || '').toString().trim();
        } else {
          userId = '';
        }
        
        if (userId) {
          try {
            user = await getUserById(userId);
          } catch (userErr) {
            console.error(`Error fetching user details for user ID "${userId}":`, userErr);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error fetching car details:", err);
    
    if (err instanceof Error && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
      error = `Car with ID ${carId} not found.`;
    } else {
      error = "Failed to load car details. Please try again later.";
    }
  }

  if (error || !car) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
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
        
        <div className="space-y-8">
          <div className="w-full lg:px-52">
            <ImageCarousel images={carImages} />
          </div>
          
          <div className="w-full lg:px-52">
            <CarDetailsPage 
              car={car} 
              dealer={dealer} 
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}