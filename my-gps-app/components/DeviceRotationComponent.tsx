import { tree } from 'next/dist/build/templates/app-page';
import { isAbsolute } from 'path';
import { useState, useEffect } from 'react';

const DeviceRotationComponent = () => {
  const [orientation, setOrientation] = useState({
    alpha: 0,  // z-axis rotation [0, 360)
    beta: 0,   // x-axis rotation [-180, 180]
    gamma: 0,  // y-axis rotation [-90, 90]
    absolute: false
  });
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [isCompass, setIsCompass] = useState(false);

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: Math.round(event.alpha || 0),  // Compass direction
      beta: Math.round(event.beta || 0),    // Front/back tilt
      gamma: Math.round(event.gamma || 0), // Left/right tilt
      absolute: event.absolute || false    
    });
  };
  

  

  const startTracking = async () => {
    // Check if DeviceOrientationEvent is available
    if (!window.DeviceOrientationEvent) {
      setError('Device orientation is not supported by your device');
      return;
    }
    try {
      window.addEventListener('deviceorientation', handleOrientation);
      setIsTracking(true);
      setError('');
    } catch (err) {
      setError('Error accessing device orientation: ' + (err as Error).message);
    }
  };

  const stopTracking = () => {
    window.removeEventListener('deviceorientation', handleOrientation);
    setIsTracking(false);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isTracking]);

  return (
    <div className="p-4">
      <button 
        onClick={isTracking ? stopTracking : startTracking}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {isTracking && (
        <div className="mt-4 space-y-2">
          <div>Compass Direction (alpha): {orientation.alpha}°</div>
          <div>Front/Back Tilt (beta): {orientation.beta}°</div>
          <div>Left/Right Tilt (gamma): {orientation.gamma}°</div>
          <div>(absolute): {orientation.absolute}°</div>
          
        </div>
      )}
    </div>
  );
};

export default DeviceRotationComponent;