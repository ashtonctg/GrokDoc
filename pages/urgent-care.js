import { useState, useEffect } from 'react';
import Header from "../components/common/Header";
import MapView from '../components/locationFinder/MapView';
import FacilityList from '../components/locationFinder/FacilityList';
import LocationPrompt from '../components/locationFinder/LocationPrompt';

export default function UrgentCarePage() {
  const [userLocation, setUserLocation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyFacilities();
    }
  }, [userLocation]);

  const fetchNearbyFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/facilities?lat=${userLocation.lat}&lng=${userLocation.lng}&accuracy=${userLocation.accuracy}`
      );
      if (!res.ok) throw new Error('Failed to fetch facilities');
      const data = await res.json();
      setFacilities(data.results || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load nearby facilities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <hr className="header-line" />
      
      {!userLocation ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <LocationPrompt setUserLocation={setUserLocation} />
        </div>
      ) : loading ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <h2 style={{
            fontFamily: "countach, sans-serif",
            fontSize: "1.8rem",
            margin: 0,
            color: "#fff"
          }}>
            Finding Nearby Facilities
          </h2>
          <div style={{
            fontSize: "2.5rem",
            color: "#fff",
            animation: "pulse 1.5s ease-in-out infinite",
            letterSpacing: "0.5rem",
            marginTop: "0.5rem",
            paddingLeft: "0.5rem"
          }}>
            • • •
          </div>
        </div>
      ) : error ? (
        <div style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: "#ff4444" 
        }}>
          {error}
        </div>
      ) : (
        <div style={{ flex: 1, position: 'relative' }}>
          <MapView 
            facilities={facilities} 
            userLocation={userLocation}
            style={{ height: '100%' }}
          />
        </div>
      )}
    </div>
  );
} 