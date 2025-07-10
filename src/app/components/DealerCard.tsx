import Image from 'next/image';
import Link from 'next/link';

interface ArrowIconProps {
  className?: string;
}

// ArrowIcon component for the clickable navigation arrow
const ArrowIcon = ({ className }: ArrowIconProps) => (
  <div className={`${className} flex items-center justify-center rounded-full bg-[#272D3C] p-1`}>
    <svg 
      fill="none" 
      stroke="white" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

// Define interface for DealerCard props
interface DealerCardProps {
  dealerImageSrc: string;
  dealershipName: string;
  location: string;
  dealershipPageUrl: string;
}

// DealerCard component
const DealerCard = ({ dealerImageSrc, dealershipName, location, dealershipPageUrl }: DealerCardProps) => {
  // Extract the dealer ID from the URL or use a formatted version of the name
  const dealerId = dealershipPageUrl.split('/').pop() || 
                  dealershipName.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="bg-white shadow-lg hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden">
      {/* Image container with 16:9 aspect ratio */}
      <div className="relative bg-white w-full pb-[56.25%]">
        <Image
          src={dealerImageSrc}
          alt={`${dealershipName} dealership`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
      </div>
      
      {/* Content section with dealership info and arrow */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold truncate" title={dealershipName}>
            {dealershipName}
          </h2>
          <p className="text-gray-600">{location}</p>
        </div>
        <Link 
          href={`/dealers/${dealerId}`}
          aria-label={`Visit ${dealershipName} page`}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
        >
          <ArrowIcon className="w-9 h-9 text-[#272D3C] hover:text-[#c1ff72]" />
        </Link>
      </div>
    </div>
  );
};

export default DealerCard;