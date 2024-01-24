import * as React from 'react';
import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDevices, requestPermission } from './useBT.js';

export default function App() {
  const [showThub, setShowThub] = React.useState(false);
  const [inclination, setInclination] = React.useState();

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
            setShowThub(true)
            let address
            let bonded
            thub.map(th => {
              address = th.address
              bonded = th.bonded
            })
            if(!bonded) {
              const pairing = await RNBluetoothClassic.pairDevice(address)
              console.log(pairing, 'device Paired')
            } else {
              console.log('Device already paired')
            }
            
          } else {
            console.log('No devices found')
          }
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
      <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}}>
        <Text>Pair THUB</Text>
      </Pressable> }
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
