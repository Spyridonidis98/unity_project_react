import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

const GPSComponent = () => {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Please allow location access to use this feature');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setError('Location request timed out');
            break;
          default:
            setError('An unknown error occurred');
        }
        setLoading(false);
      }
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={getLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <MapPin className="w-5 h-5" />
        {loading ? 'Getting Location...' : 'Get My Location 2'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {coordinates && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Your Coordinates:</h2>
          <p className="text-gray-700">
            <span className="font-medium">Latitude:</span> {coordinates.latitude.toFixed(6)}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Longitude:</span> {coordinates.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default GPSComponent;