import HeroSection from "./components/searchbanner";
import CarTypeBrowser from "./components/cartypebrowser";
import CarManufacturerBrowser from "./components/carmanufacturerbrowser";
import CarPurchaseSteps from "./components/carpurchase";

export default function Home() {
  return (
    <div >
      <HeroSection/>
      <div className="flex flex-col items-center py-12">
        <div className="w-24 h-0.5 bg-gray-400 mb-4"></div>
        <div className="font-bold lg:text-4xl text-2xl px-14">Search By Category</div>
      </div>
      <CarTypeBrowser/>
      <CarManufacturerBrowser/>
      <CarPurchaseSteps />
    </div>
  );
}