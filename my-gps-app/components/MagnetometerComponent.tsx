import { useState, useEffect, Dispatch, SetStateAction } from 'react';

declare global {
  interface Window {
    Magnetometer?: any;
  }
}

interface MagnetData {
    x: number;
    y: number;
    z: number;
    heading: number;
  }
  
interface MagnetometerProps {
    magnetData: MagnetData;
    setMagnetData: Dispatch<SetStateAction<MagnetData>>;
}



  
const MagnetometerComponent = () => {
  const [magnetData, setMagnetData] = useState({
        x: 0,
        y: 0,
        z: 0,
        heading: 0
    });
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [sensor, setSensor] = useState<any>(null);

  const calculateHeading = (x: number, y: number) => {
    // Convert magnetometer values to heading in degrees
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    // Normalize to 0-360
    heading = heading < 0 ? heading + 360 : heading;
    return Math.round(heading-90);
  };

  const startTracking = async () => {
    try {
      // Check if Magnetometer is supported
      if (!('Magnetometer' in window)) {
        throw new Error('Magnetometer not supported');
      }

      // Request permission
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'magnetometer' as any });
        if (permission.state === 'denied') {
          throw new Error('Permission to access magnetometer was denied');
        }
      }

      // Create and start the sensor
      const magSensor = new window.Magnetometer({ frequency: 60 });
      
      magSensor.addEventListener('reading', () => {
        const heading = calculateHeading(magSensor.x, magSensor.y);
        setMagnetData({
          x: Math.round(magSensor.x * 100) / 100,
          y: Math.round(magSensor.y * 100) / 100,
          z: Math.round(magSensor.z * 100) / 100,
          heading: heading
        });
      });

      magSensor.addEventListener('error', (error: Error) => {
        setError('Magnetometer error: ' + error.message);
        setIsTracking(false);
      });

      magSensor.start();
      setSensor(magSensor);
      setIsTracking(true);
      setError('');

    } catch (err) {
      setError('Error accessing magnetometer: ' + (err as Error).message);
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (sensor) {
      sensor.stop();
      setSensor(null);
    }
    setIsTracking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sensor) {
        sensor.stop();
      }
    };
  }, [sensor]);

  const getCompassDirection = (heading: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <div className="p-4">
      <button 
        onClick={isTracking ? stopTracking : startTracking}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isTracking ? 'Stop Magnetometer' : 'Start Magnetometer'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}

      {isTracking && (
        <div className="mt-4 space-y-2">
          <div>Magnetic Field X: {magnetData.x} μT</div>
          <div>Magnetic Field Y: {magnetData.y} μT</div>
          <div>Magnetic Field Z: {magnetData.z} μT</div>
          <div>Heading: {magnetData.heading}° ({getCompassDirection(magnetData.heading)})</div>
        </div>
      )}
    </div>
  );
};

export default MagnetometerComponent;