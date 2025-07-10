import { useState } from 'react';

interface CarSearchInputProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const CarSearchInput: React.FC<CarSearchInputProps> = ({ 
  onSearch, 
  placeholder = "Search your desired car",
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (): void => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      onSearch?.(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`w-full max-w-lg bg-white rounded-xl p-1 shadow-lg ${className}`}>
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 sm:px-4 py-3 sm:py-2 text-gray-600 bg-gray-50 border-none outline-none text-sm sm:text-base placeholder-gray-400 focus:bg-white transition-colors min-h-[44px]"
        />
        <button
          onClick={handleSearch}
          className="bg-[#000000] hover:bg-[#a2d462] active:bg-[#a2d462] text-white px-3 sm:px-8 py-3 sm:py-4 font-semibold text-xs sm:text-sm tracking-wide transition-all duration-200 active:translate-y-px min-h-[44px] touch-manipulation whitespace-nowrap"
        >
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default CarSearchInput;