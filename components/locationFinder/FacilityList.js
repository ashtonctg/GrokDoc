import { calculateDistance } from '../../lib/maps';

export default function FacilityList({ facilities, userLocation }) {
  return (
    <div style={{
      marginTop: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    }}>
      {facilities.map((facility) => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          facility.geometry.location.lat,
          facility.geometry.location.lng
        ).toFixed(1);

        return (
          <div
            key={facility.place_id}
            style={{
              backgroundColor: "#2a2a2a",
              padding: "1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${facility.geometry.location.lat},${facility.geometry.location.lng}`,
                '_blank'
              );
            }}
          >
            <div style={{ fontWeight: "bold" }}>{facility.name}</div>
            <div style={{ color: "#999", fontSize: "0.9rem" }}>
              {facility.vicinity} • {distance}km away
            </div>
          </div>
        );
      })}
    </div>
  );
} 