import { useState } from 'react';
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

// Updated map control styles
const mapControlStyles = `
  .gm-style .gm-bundled-control {
    margin-right: 12px !important;
  }
  
  .gm-style .gmnoprint > div {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .gm-style .gm-bundled-control button,
  .gm-style button.gm-fullscreen-control {
    background-color: #2a2a2a !important;
    border: none !important;
    width: 40px !important;
    height: 40px !important;
    border-radius: 4px !important;
    transition: all 0.3s ease !important;
  }
  
  .gm-style .gm-bundled-control button:hover,
  .gm-style button.gm-fullscreen-control:hover {
    background-color: #3a3a3a !important;
    transform: scale(1.05);
  }

  /* Hide the separator line between zoom controls */
  .gm-style .gmnoprint > div > div:not(:first-child) {
    display: none !important;
  }

  /* Hide all attribution elements */
  .gm-style-cc,
  .gmnoprint.gm-style-cc,
  .gm-style .gm-style-cc {
    display: none !important;
  }

  /* Hide Google Maps link */
  a[href^="https://maps.google.com/maps"] {
    display: none !important;
  }

  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateX(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }
`;

export default function MapView({ facilities, userLocation, style }) {
  const [hoveredFacility, setHoveredFacility] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']  // Add geometry library
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Add global styles once */}
      <style jsx global>
        {mapControlStyles}
      </style>

      <GoogleMap
        zoom={13}
        center={userLocation}
        mapContainerStyle={{
          width: '100%',
          height: '100%'
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
        {/* User location marker */}
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
            onMouseOver={() => setHoveredFacility(facility)}
            onMouseOut={() => setHoveredFacility(null)}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${facility.geometry.location.lat},${facility.geometry.location.lng}`,
                '_blank'
              );
            }}
          />
        ))}
      </GoogleMap>

      {/* Hover Card - Updated positioning and styling */}
      {hoveredFacility && (
        <div
          style={{
            position: 'absolute',
            top: '5rem', // Moved down below header
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid #333',
            width: '500px', // Increased width
            animation: 'slideInFromTop 0.3s ease-out',
            zIndex: 1000
          }}
        >
          <h3 style={{
            margin: '0 0 0.75rem 0',
            color: '#fff',
            fontSize: '1.4rem', // Increased font size
            fontFamily: 'countach, sans-serif',
            letterSpacing: '0.02em'
          }}>
            {hoveredFacility.name}
          </h3>
          <p style={{
            margin: '0 0 0.75rem 0',
            color: '#ccc',
            fontSize: '1rem' // Slightly increased
          }}>
            {hoveredFacility.vicinity}
          </p>
          <p style={{
            margin: '0',
            color: '#0d8157',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {(google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(userLocation.lat, userLocation.lng),
              new google.maps.LatLng(
                hoveredFacility.geometry.location.lat,
                hoveredFacility.geometry.location.lng
              )
            ) * 0.000621371).toFixed(1)} miles away
          </p>
        </div>
      )}

      {/* Updated animation for centered card */}
      <style jsx global>{`
        @keyframes slideInFromTop {
          from { 
            opacity: 0; 
            transform: translate(-50%, -20px); 
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, 0); 
          }
        }
      `}</style>
    </div>
  );
} 