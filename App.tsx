/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import MapView, { Marker, AnimatedRegion, Region } from 'react-native-maps';


const { width, height } = Dimensions.get('window');


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  //Initial Location (Arbitrary location for testing purpose)
  const [location, setLocation] = useState({
    latitude: 24.858342986399865,
    longitude: 55.066739235969116,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [pageNo, setPageNo] = useState(1); // Since we are using pagination,to retrieve the location data, hence we use PageNumber
  const [totalPageCount, setTotalPageCount] = useState(0); // Total page count to stop tracking once all the pages are fetched
  const [isTracking, setIsTracking] = useState(false); // To start/stop tracking

  // Initialize coordinate as AnimatedRegion
  const coordinate = useRef<AnimatedRegion>(new AnimatedRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: location.latitudeDelta,
      longitudeDelta: location.longitudeDelta,
    })).current;
  

  /*
   This useEffect hook is used to fetch the vehicle location data from the API
    and update the location of the vehicle marker on the map.
    The location data is fetched every 3 seconds until all the pages are fetched.
  */
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      try {
        const body = {
          vehicleId: 'Vehicle 1',
          pageNo: pageNo,
        };
        const response = await axios.post(`${API_URL}/api/getVehicleLocation`, body);

        console.log(`API response:${pageNo}:`,response.data.responseData);

        if (response.data.responseCode === 200) {
          const locationObj = response.data.responseData;
          const locationArr = locationObj.location.coordinates;
          const [longitude, latitude] = locationArr;


          if(pageNo === 1){
             // Update total page count
             setTotalPageCount(parseInt(locationObj.totalRecords,10));
          }

          // Update location state
          setLocation((prevLocation) => ({
            ...prevLocation,
            latitude,
            longitude,
          }));

          setPageNo(prevPageNo => {
            if (prevPageNo >= totalPageCount) {

              // Stop tracking
              setIsTracking(!isTracking);

              // Reset page number
              setPageNo(1);

              // Clear interval
              clearInterval(intervalId as NodeJS.Timeout);
              return prevPageNo;
            }
            return prevPageNo + 1;
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Animate marker to the new location
    const animateMarker = () => {
      coordinate
        .timing({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: location.latitudeDelta,
          longitudeDelta: location.longitudeDelta,
          duration: 500,
          useNativeDriver: false,
        }as any)
        .start();

        
    };

    // Start tracking
    if (isTracking) {
      intervalId = setInterval(() => {
        fetchData();
        animateMarker();
      }, 3000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, pageNo, location, coordinate]);



  // Calculate region dynamically based on current location
  const region: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: location.latitudeDelta,
    longitudeDelta: location.longitudeDelta,
  };

  return (
    <SafeAreaView style={backgroundStyle}>

      <View style={styles.container}>
            <MapView 
              style={styles.map} 
              initialRegion={location}
              region={region} 
              >
                <Marker.Animated
                  coordinate={coordinate as any}
                  title="Vehicle"
                  description="Vehicle in transit"
                />
            </MapView>
           
            <TouchableOpacity
                style={styles.button}
                onPress={() => setIsTracking(!isTracking)}
              >
                <Text style={styles.buttonText}>
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Text>
              </TouchableOpacity>
      </View>

     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#ddd',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width,
    height: height,
  },

  button: {
    backgroundColor: '#007bff', 
    padding: 10,
    borderRadius: 5,
    width: 150,
    position: 'absolute',
    bottom: 0,
    left: 20,
    alignItems: 'center',
    height: 40,
  },
  buttonText: {
    color: '#ffffff',
  },

});

export default App;


//Source: AW Rostamani Trading Warehouse, Dubai Industrial City - Dubai - United Arab Emirates
//Destination: BLVD Heights - Downtown - Emaar, Dubai Opera District - Dubai - United Arab Emirates