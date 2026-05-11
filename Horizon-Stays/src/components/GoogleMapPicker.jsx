import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%"
};

const defaultCenter = {
  lat: 36.2704,
  lng: -121.8081
};

export function GoogleMapPicker({ apiKey, position, onChange }) {
  const center = position || defaultCenter;

  const { isLoaded } = useJsApiLoader({
    id: "host-location-google-map",
    googleMapsApiKey: apiKey || ""
  });

  const handleMapClick = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (typeof lat === "number" && typeof lng === "number") {
      onChange({ lat, lng });
    }
  };

  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (typeof lat === "number" && typeof lng === "number") {
      onChange({ lat, lng });
    }
  };

  if (!apiKey) {
    return (
      <div className="hostMapFallback">
        <p>Add your Google Maps API key to enable draggable pin.</p>
        <small>Set VITE_GOOGLE_MAPS_API_KEY in your .env file.</small>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="hostMapFallback">Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      onClick={handleMapClick}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false
      }}
    >
      <MarkerF position={center} draggable onDragEnd={handleMarkerDragEnd} />
    </GoogleMap>
  );
}
