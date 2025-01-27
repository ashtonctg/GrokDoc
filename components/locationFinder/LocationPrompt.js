import { useState, useRef, useEffect } from 'react';

export default function LocationPrompt({ setUserLocation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const getCurrentLocation = async () => {
    console.log('[Location] Starting location request...');
    setIsLoading(true);
    setError(null);

    try {
      // Try Google Maps Geolocation API first
      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          considerIp: true,
        }),
      });

      const data = await response.json();
      console.log('[Location] Google Geolocation API response:', data);

      if (data.location) {
        setUserLocation({
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy,
          source: 'google'
        });
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('[Location] Google Geolocation API failed:', error);
      // Fall back to browser geolocation if Google API fails
      fallbackToBrowserGeolocation();
    }
  };

  const fallbackToBrowserGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      console.log('[Location] Browser geolocation success:', position);
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: 'browser'
      });
      setIsLoading(false);
    };

    const handleError = (error) => {
      console.error('[Location] Browser geolocation error:', error);
      // Fall back to IP-based location
      getFallbackLocation();
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  };

  // IP-based fallback
  const getFallbackLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('[Location] IP-based location:', data);
      
      if (data.latitude && data.longitude) {
        setUserLocation({
          lat: data.latitude,
          lng: data.longitude,
          accuracy: 5000  // IP-based location is less accurate
        });
      } else {
        setError('Could not determine your location');
      }
    } catch (error) {
      console.error('[Location] IP fallback failed:', error);
      setError('Could not determine your location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <button 
        className="button" 
        onClick={getCurrentLocation}
        disabled={isLoading}
      >
        {isLoading ? 'Getting Location...' : 'Share My Location'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      {isLoading && <p style={{ marginTop: '1rem' }}>Acquiring your precise location...</p>}
    </div>
  );
} 