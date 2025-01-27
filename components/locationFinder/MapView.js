import { useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// Grayscale style for minimal design
const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  // Hide all POIs except roads
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  },
  // Keep road labels
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  // Keep transit stations and lines hidden
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "off" }]
  }
];

export default function MapView({ facilities, userLocation, style }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <GoogleMap
      zoom={13}
      center={userLocation}
      mapContainerStyle={{
        width: '100%',
        height: '100%',
        ...style
      }}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: false,
        mapTypeControl: false,
        scaleControl: false,
        rotateControl: false
      }}
    >
      {/* Custom styles for zoom controls */}
      <style jsx global>{`
        .gm-style .gm-bundled-control {
          margin-right: 12px !important;
          margin-bottom: 80px !important;
        }
        
        /* Style the zoom buttons container */
        .gm-style .gmnoprint > div {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* Style individual zoom buttons */
        .gm-style .gm-bundled-control button {
          background-color: #2a2a2a !important;
          border: none !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 4px !important;
          transition: background-color 0.3s !important;
        }
        
        /* Hover state */
        .gm-style .gm-bundled-control button:hover {
          background-color: #3a3a3a !important;
          transform: scale(1.05);
        }
        
        /* Style the plus/minus symbols */
        .gm-style .gm-bundled-control button > span {
          background-color: transparent !important;
          color: #ffffff !important;
        }
        
        /* Style the vertical separator */
        .gm-style .gm-bundled-control .gmnoprint > div > div {
          background-color: #333 !important;
          margin: 4px 0 !important;
        }
        
        /* Style fullscreen button with increased margin */
        .gm-style button.gm-fullscreen-control {
          background-color: #2a2a2a !important;
          border: none !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 4px !important;
          margin-bottom: 16px !important;
          transition: background-color 0.3s !important;
        }
        
        .gm-style button.gm-fullscreen-control:hover {
          background-color: #3a3a3a !important;
          transform: scale(1.05);
        }

        /* Add just these new rules to hide attribution */
        .gm-style-cc {
          display: none !important;
        }
        
        .gmnoprint.gm-style-cc {
          display: none !important;
        }
        
        .gm-style a[href^="https://maps.google.com/maps"] {
          display: none !important;
        }
      `}</style>

      {/* User location */}
      <Marker
        position={userLocation}
        icon={{
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: "#0d8157",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
          scale: 2,
          anchor: new google.maps.Point(12, 22),
        }}
        zIndex={2}
      />

      {/* Facility markers */}
      {facilities.map((facility) => (
        <Marker
          key={facility.place_id}
          position={facility.geometry.location}
          icon={{
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#ff4444",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#FFFFFF",
            scale: 1.5,
            anchor: new google.maps.Point(12, 22),
          }}
          title={facility.name}
          onClick={() => {
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${facility.geometry.location.lat},${facility.geometry.location.lng}`,
              '_blank'
            );
          }}
        />
      ))}
    </GoogleMap>
  );
} 