import * as React from 'react';
import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { performRead, requestPermission, stopReading } from './useBT.js';


export default function App() {
  const [showThub, setShowThub] = React.useState(false);
  const [inclination, setInclination] = React.useState();


  let connectionOptions = {
    CONNECTION_TYPE: 'binary'
  }

  let address
  let bonded
  let device = null;

  const scanForDevices = async () => {
    const hasPermission = await requestPermission();
    if(hasPermission) {
      try {
        const unpaired = await RNBluetoothClassic.startDiscovery();
        console.log(`Found ${unpaired.length} unpaired devices.`);
        if(unpaired.length > 0) {
          const thub = unpaired.filter(device => device.name == 'Tiltit')
          if(thub.length != 0) {
            await RNBluetoothClassic.cancelDiscovery();
            device = thub[0]
            setShowThub(true)
            address = device.address
            bonded = device.bonded
            if(!bonded) {
              console.log('bonding')
              await RNBluetoothClassic.pairDevice(address)
              console.log('device Paired')
              await device.connect(connectionOptions)
              console.log('connected')
              performRead(device)
            } else {
              console.log('Device already paired')
              try {
                console.log('trying to connect to tiltit')
                await device.connect(connectionOptions);
                console.log('connected')
                performRead(device)
              } catch (err) {
                console.error('sub', err);
              }
            }
          }
          } else {
            console.log('THUB not found')
          }
        } catch (err) {
        console.log(err.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => scanForDevices()}>
        <Text>Look for devices</Text>
      </Pressable>
      { showThub && 
        <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => stopReading(device)}>
          <Text>Stop listening</Text>
        </Pressable> }
      <StatusBar style="dark" />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
