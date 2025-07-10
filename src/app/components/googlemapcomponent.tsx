// components/googlemapcomponent.tsx
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useEffect, useRef, ReactElement } from "react";

// Type definitions
interface Dealer {
  name: string;
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface LatLng {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  center: LatLng;
  zoom?: number;
  dealer?: Dealer;
}

interface GoogleMapProps {
  center: LatLng;
  zoom?: number;
  dealer?: Dealer;
}

const render = (status: Status): ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="h-64 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-2">Loading Maps...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="h-64 bg-red-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-sm">Error loading maps</p>
            <p className="text-red-400 text-xs mt-1">Please check your internet connection</p>
          </div>
        </div>
      );
    default:
      return (
        <div className="h-64 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Initializing...</p>
        </div>
      );
  }
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  center,
  zoom = 15,
  dealer 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (ref.current && window.google && !mapRef.current) {
      // Initialize map
      mapRef.current = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Add marker
      markerRef.current = new google.maps.Marker({
        position: center,
        map: mapRef.current,
        title: dealer?.name || "Location",
        animation: google.maps.Animation.DROP,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' fill='%23ef4444'/%3e%3c/svg%3e",
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40)
        }
      });

      // Add info window
      if (dealer?.name) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-1">${dealer.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${dealer.location?.address || "Address not specified"}</p>
              ${dealer.location?.latitude && dealer.location?.longitude ? 
                `<p class="text-xs text-gray-500">
                  ${dealer.location.latitude.toFixed(6)}, ${dealer.location.longitude.toFixed(6)}
                </p>` : ''
              }
            </div>
          `
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapRef.current, markerRef.current);
        });

        // Auto-open info window after a short delay
        setTimeout(() => {
          infoWindow.open(mapRef.current, markerRef.current);
        }, 1000);
      }
    }
  }, []);

  // Update map center and marker position when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter(center);
      markerRef.current.setPosition(center);
    }
  }, [center]);

  return <div ref={ref} className="w-full h-full" />;
};

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  center, 
  zoom = 15, 
  dealer 
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return (
      <div className="h-64 bg-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-800 text-sm font-medium">Google Maps API key not configured</p>
          <p className="text-yellow-700 text-xs mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={["places"]}>
      <MapComponent center={center} zoom={zoom} dealer={dealer} />
    </Wrapper>
  );
};

export default GoogleMap;