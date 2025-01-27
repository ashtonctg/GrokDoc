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
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          Loading nearby facilities...
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
        <div style={{ 
          flex: 1, 
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          <MapView 
            facilities={facilities} 
            userLocation={userLocation}
            style={{ flex: 1 }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '30vh',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderTop: '1px solid #333',
            overflow: 'auto',
            padding: '1rem'
          }}>
            <FacilityList 
              facilities={facilities} 
              userLocation={userLocation}
            />
          </div>
        </div>
      )}
    </div>
  );
} 