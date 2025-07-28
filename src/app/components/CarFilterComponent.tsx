import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

export interface Filters {
  search: string;
  brand: string;
  model: string;
  mileage: string;
  price: string;
  bodyType: string;
  fuelType: string;
  color: string;
  transmission: string;
  modelYear: string;
}

interface FilterSelectProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
}

interface CarFilterComponentProps {
  onFiltersChange: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
}

export default function CarFilterComponent({ onFiltersChange, initialFilters = {} }: CarFilterComponentProps) {
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
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
    modelYear: '',
    ...initialFilters
  });

  // Update filters when initialFilters change (from URL parameters)
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...initialFilters
    }));
  }, [initialFilters]);

  const handleFilterChange = (filterName: keyof Filters, value: string): void => {
    const newFilters = {
      ...filters,
      [filterName]: value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleMoreFilters = (): void => {
    setShowMoreFilters(!showMoreFilters);
  };

  const clearFilters = (): void => {
    const clearedFilters: Filters = {
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setShowMoreFilters(false); // Close more filters when clearing
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const FilterSelect = ({ placeholder, value, onChange, options = [] }: FilterSelectProps) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 pr-10 bg-white border border-gray-200 rounded-lg text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );

  // Sample options for dropdowns
  const brandOptions: FilterOption[] = [
    { value: 'Audi', label: 'Audi' },
    { value: 'BMW', label: 'BMW' },
    { value: 'Ford', label: 'Ford' },
    { value: 'Honda', label: 'Honda' },
    { value: 'Hyundai', label: 'Hyundai' },
    { value: 'Subaru', label: 'Subaru' },
    { value: 'Mazda', label: 'Mazda' },
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
    { value: 'Nissan', label: 'Nissan' },
    { value: 'toyota', label: 'toyota' },
    { value: 'Volkswagen', label: 'Volkswagen' },
    { value: 'Volvo', label: 'Volvo' },
    { value: 'Land Rover', label: 'Land Rover' },
    { value: 'Lexus', label: 'Lexus' },
    { value: 'Suzuki', label: 'Suzuki' },
    { value: 'Porsche', label: 'Porsche' },
    { value: 'Rolls Royce', label: 'Rolls Royce' },
    { value: 'Jaguar', label: 'Jaguar' },
    { value: 'Mclaren', label: 'Mclaren' }
  ];

  const bodyTypeOptions: FilterOption[] = [
    { value: 'SUV', label: 'SUV' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Sedan', label: 'Sedan' },
    { value: 'Coupe', label: 'Coupe' },
    { value: 'Wagon', label: 'Wagon' },
    { value: 'Van', label: 'Van' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Convertible', label: 'Convertible' }
  ];

  const mileageOptions: FilterOption[] = [
    { value: '0-25000', label: '0 - 25,000 kilometers' },
    { value: '25000-50000', label: '25,000 - 50,000 kilometers' },
    { value: '50000-100000', label: '50,000 - 100,000 kilometers' },
    { value: '100000+', label: '100,000+ kilometers' }
  ];

  const priceOptions: FilterOption[] = [
    { value: '0-1500000', label: '0 - 1,500,000' },
    { value: '1500000-3000000', label: '1,500,000 - 3,000,000' },
    { value: '3000000-5000000', label: '3,000,000 - 5,000,000' },
    { value: '5000000+', label: '5,000,000+' }
  ];

  const fuelTypeOptions: FilterOption[] = [
    { value: 'gasoline', label: 'Gasoline' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Petrol', label: 'Petrol'}
  ];

  const transmissionOptions: FilterOption[] = [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
    { value: 'cvt', label: 'CVT' }
  ];

  const modelYearOptions: FilterOption[] = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2019', label: '2019' },
    { value: '2018', label: '2018' },
    { value: '2017', label: '2017' },
    { value: '2016', label: '2016' },
    { value: '2015', label: '2015' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gray-50 rounded-xl mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search your desired car (brand, model, etc.)"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full h-12 pl-12 pr-32 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={toggleMoreFilters}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors ${
            showMoreFilters ? 'text-blue-600' : ''
          }`}
        >
          <span className="text-sm font-medium">More Filters</span>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Basic Filters (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 text-sm gap-4 mb-4">
        <FilterSelect
          placeholder="Brand"
          value={filters.brand}
          onChange={(value) => handleFilterChange('brand', value)}
          options={brandOptions}
        />
        <FilterSelect
          placeholder="Mileage"
          value={filters.mileage}
          onChange={(value) => handleFilterChange('mileage', value)}
          options={mileageOptions}
        />
        <FilterSelect
          placeholder="Price"
          value={filters.price}
          onChange={(value) => handleFilterChange('price', value)}
          options={priceOptions}
        />
      </div>

      {/* Additional Filters (Toggleable) */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        showMoreFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="grid grid-cols-1 text-sm md:grid-cols-3 gap-4 pt-2">
          <FilterSelect
            placeholder="Body Type"
            value={filters.bodyType}
            onChange={(value) => handleFilterChange('bodyType', value)}
            options={bodyTypeOptions}
          />
          <FilterSelect
            placeholder="Fuel Type"
            value={filters.fuelType}
            onChange={(value) => handleFilterChange('fuelType', value)}
            options={fuelTypeOptions}
          />
          <FilterSelect
            placeholder="Transmission"
            value={filters.transmission}
            onChange={(value) => handleFilterChange('transmission', value)}
            options={transmissionOptions}
          />
          <FilterSelect
            placeholder="Model Year"
            value={filters.modelYear}
            onChange={(value) => handleFilterChange('modelYear', value)}
            options={modelYearOptions}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-red-100 text-red-700 font-medium text-sm rounded-lg hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}