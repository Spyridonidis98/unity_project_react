'use client';  // This is important since we're using client-side features!
import { useState, useRef, useEffect, Dispatch, SetStateAction  } from 'react';
import GPSComponent from '../components/GPSComponent';
import DeviceRotationComponet from '../components/DeviceRotationComponent';
import MagnetometerComponent  from '@/components/MagnetometerComponent';
import { tree } from 'next/dist/build/templates/app-page';

let glob_par_0 = false;

function Test(){
  const name = 'Jim';
  return <h1>Hello {name}</h1>;
}

function Test2() {
  const name = 'Jim';
  const [message, setMessage] = useState<string>('');
  
  const handleClick = () => {
    setMessage('you just clicked the button');
  };

  return (
    <div>
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click me
      </button>
      {message && (<h1>{message}</h1>)}
    </div>
  );
}

function Test3() {
  //messages
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  /////////////////////////GPS///////////////////////////
  // const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const coordinates = useRef<{ latitude: number; longitude: number } | null>(null);
  const [timesGPSUpdated, setTimesGPSUpdated] = useState(0);
  const GPSWatchIdRef = useRef<number>(null);

  ///////////////////////magnitometer////////////////////
  const orientation = useRef<number| null>(null);
  const [timesOrientUpdated, setTimesOrientUpdated] = useState(0);
  const magSensorRef = useRef<any>(null);

  ///////////////server-for loop request/////////////////
  const [timesDataSend, setTimesDataSend] = useState(0);
  const newSensorData = useRef<boolean>(false); //use newSensorData.current = value updates synchronously not like setNewSensorData(value)
  const exit = useRef<boolean>(false);
  // const [newSensorData, setNewSensorData] = useState<boolean>(false); // while loop closes with the current value of newSensorData and dosent update need to use useRef here 
  // const [exit, setExit] = useState(false); wont be updated inside loop, use userRef instead

  //////////////user-input/////////////////////////////
  const userName = useRef<HTMLInputElement>(null);
  const userType = useRef<HTMLSelectElement>(null);
  const getUserName = () => {
      return userName.current?.value || '';
  };
  const getUserType = () => {
      return userType.current?.value || '';
  };

  ////////////delete-user/////////////////////////////
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const deletedUser = useRef<HTMLInputElement>(null);




  //   // Cleanup on unmount
  // useEffect(() => {
  //   return () => {
  //     if (sensor) {
  //       sensor.stop();
  //     }
  //   };
  // }, [sensor]);

  // // Keep ref in sync with state
  // useEffect(() => {
  //     newSensorDataRef.current = newSensorData;
  // }, [newSensorData]);


  // GPS coordinates ////////////////////////////////
  const getGPS = async() => {
    
    setMessage('Requesting location access...');

    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
      return;
    }


    const options = {
      enableHighAccuracy: true,  // Use GPS if available
      timeout: 10000,           // Time to wait for position
      maximumAge: 0             // Don't use cached position
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Check if accuracy is good enough (less than 50 meters)
        if (position.coords.accuracy <= 50) {
          // setCoordinates({
          //   latitude: position.coords.latitude,
          //   longitude: position.coords.longitude
          // }); // Instead of setCoordinates, you'd use coordinates.current
          coordinates.current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          newSensorData.current = true; // setNewSensorData(true);
          setTimesGPSUpdated(prevRuns => prevRuns + 1);
        } else {
          setMessage(`Improving GPS accuracy: ${Math.round(position.coords.accuracy)}m`);
        }
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
            setError('Location request timed out. Please try again');
            break;
          default:
            setError('An unknown error occurred');
        }

      },
      options
    );
    GPSWatchIdRef.current = watchId;
    // Set a timeout to stop watching if it takes too long
    // setTimeout(() => {
    //   // if (loading) {
    //     navigator.geolocation.clearWatch(watchId);
    //     exit.current = true;
    // }, 10000);
  };


  const calculateHeading = (x: number, y: number) => {
    // Convert magnetometer values to heading in degrees
    let heading = (Math.atan2(y, x) * 180) / Math.PI;
    // Normalize to 0-360
    heading = heading < 0 ? heading + 360 : heading;
    return Math.round(heading-90);
  };
  
  const getMagnetometer = async () => {
      // Create and start the sensor
      try{
        // const magSensor = new window.Magnetometer({ frequency: 1});
        const magSensor = new window.Magnetometer({ frequency: 1});
        magSensor.addEventListener('reading', () => {
          const heading = calculateHeading(magSensor.x, magSensor.y);
          // setMagnetData({
          //   x: Math.round(magSensor.x * 100) / 100,
          //   y: Math.round(magSensor.y * 100) / 100,
          //   z: Math.round(magSensor.z * 100) / 100,
          //   heading: heading
          // });
          orientation.current = heading;
          newSensorData.current = true;
          setTimesOrientUpdated(prevRuns => prevRuns + 1)
        });

        magSensor.addEventListener('error', (error: Error) => {
          setError('Magnetometer error: ' + error.message);
        });

        magSensor.start();
        magSensorRef.current = magSensor;
        // magSensor.stop();
        
    }catch(err) {
      setError('Error accessing magnetometer: ' + (err as Error).message);
      exit.current = true;
    }
  };
  

  const startSendingData = async () => {
    exit.current = false;
    console.log('Started Sending Data');

    getGPS();
    setMessage("Started fetching GPS data");
    getMagnetometer();
    setMessage("Started fetching Magnetometer data");

    while(true){
      console.log(exit.current, newSensorData.current, getUserName(), newSensorData.current && coordinates.current);
      // 
      if(exit.current){break;}
      if(newSensorData.current && coordinates.current && orientation.current){ 
        console.log(coordinates.current?.latitude, coordinates.current?.longitude, orientation.current)

        setMessage("Started sending data");
        try {
          const response = await fetch('/api/send-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: getUserName(),
              user_type: getUserType(),
              x: coordinates.current?.longitude,
              z: coordinates.current?.latitude,//coordinates.current?.longitude,
              angle: orientation.current,
            }),
          });
          if (!response.ok) {
            setMessage("Error occurred while sending data");
            if(magSensorRef.current)magSensorRef.current.stop();
            if(GPSWatchIdRef.current)navigator.geolocation.clearWatch(GPSWatchIdRef.current);
            return;
          }
          setTimesDataSend(prevRuns => prevRuns + 1)
          // setNewSensorData(false);
          newSensorData.current = false;  // Instead of setState
          // setMessage(`Success posting data ${timesGPSUpdated} times`);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
          if(magSensorRef.current)magSensorRef.current.stop();
          if(GPSWatchIdRef.current)navigator.geolocation.clearWatch(GPSWatchIdRef.current);
        } finally {

        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));  // Add small delay 50ms
    }
    setMessage(`Timed Out after 30 seconds`);
    if(magSensorRef.current)magSensorRef.current.stop();
    if(GPSWatchIdRef.current)navigator.geolocation.clearWatch(GPSWatchIdRef.current);
    
  };

  const DeleteUser = async () => {
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: deletedUser.current?.value || ''
        }),
      });
      if (!response.ok) {
        setDeleteMessage("Failed to delete user");
        return;
      }
      setDeleteMessage("User " + deletedUser.current?.value +" deleted")
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
    }
  };


  const stopSendingData  = async () => {exit.current = true;}

  return (
    <div>
      <div className="flex items-center">
        <div className="mr-4">
          <input 
              ref={userName}
              type="text"
              defaultValue=""
              placeholder="Enter user name"
              className="px-4 py-2 border rounded text-black"
          />
        </div>
        <select 
          ref={userType}
          defaultValue="vehicle"
          className="px-4 py-2 border rounded text-black bg-white"
        >
          <option value="vehicle">vehicle</option>
          <option value="pedestrian">pedestrian</option>
          <option value="bike">bike</option>
          <option value="oculus">oculus</option>

        </select>
      </div>


      <button 
        onClick={startSendingData}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Start Sending Data
      </button>
      <button 
        onClick={stopSendingData}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Stop Sending Data
      </button>
      {message && (<h1>{message}</h1>)}
      {error && (<h1>Error: {error}</h1>)}
      {/* {status && (<h1>status {status}</h1>)}
      {loading && (<h1>loading {loading}</h1>)}
      {runs && (<h1>runs {runs}</h1>)} */}
      
      <h1>Times GPS position updated {timesGPSUpdated}</h1>
      <h1>Times Orientaion updated {timesOrientUpdated}</h1>
      <h1>Times Data Send {timesDataSend}</h1>
      {/* <h1>New Sensor Data {newSensorData.current ? 'true':'false'}</h1>
      <h1>Exit {exit.current ? 'true':'false'}</h1> */}
      {coordinates.current && (<h1>current lat: {coordinates.current.latitude}</h1>)}
      {coordinates.current && (<h1>current lot: {coordinates.current.longitude}</h1>)}
      {orientation.current && (<h1>current orientation: {orientation.current}</h1>)}
      {userName.current?.value && (<h2>User: {userName.current.value}</h2>)}


      <div className="flex items-center">
        <div className="mr-4">
          <input 
              ref={deletedUser}
              type="text"
              defaultValue=""
              placeholder="Enter user to delete"
              className="px-4 py-2 border rounded text-black"
          />
        </div>
        <button 
          onClick={DeleteUser}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Delete User
        </button>
      </div>
      {deleteMessage && (<h1>{deleteMessage}</h1>)}

    </div>

  );
}


// async function SendData(setMessage: (message: string) => void, text: string){
//   // setMessage(text);
//   try{
//     const response = await fetch('http://51.12.244.144:8000/send_position', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({
//         user:"jim",
//         x:2.43,
//         z:1.45,
//         angle:44.7
//       }),
//     });

//     if (!response.ok) {
//       setMessage("error from try");
//     }

//   }
//   catch(error){
//     setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
//   }
//   finally {
//     // setMessage("Success posting data");
//   }
// }



export default function Home() {
  return (
    <main>
      {/* <h1>Out of function </h1> */}
      <Test3/>
    </main>
  );
}
