import * as React from 'react';
import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { performRead, requestPermission } from './useBT.js';

let device = null;

export default function App() {
  const [showThub, setShowThub] = React.useState(false);
  const [inclination, setInclination] = React.useState();
  // const [device, setDevice] = React.useState(null);
  const [stop, setStop] = React.useState(false);

  let address
  let bonded

  React.useEffect(() => {
    stop && stopReading(device)
  }, [stop])

  // oriingal config that doesn't work (keep for accidents)
  let connectionOptions = {
    CONNECTION_TYPE: 'binary',
    DELIMITER: '\n',
    // READ_SIZE: 24 * 10,
  }

  const scanForDevices = async () => {
    const hasPermission = await requestPermission();
    if(hasPermission) {
      try {
        setStop(false)
        const unpaired = await RNBluetoothClassic.startDiscovery();
        console.log(`Found ${unpaired.length} unpaired devices.`);
        if(unpaired.length > 0) {
          const thub = unpaired.filter(device => device.name == 'Tiltit')
          if(thub.length != 0) {
            await RNBluetoothClassic.cancelDiscovery();
            device = thub[0]
            address = device.address
            bonded = device.bonded
            if(!bonded) {
              console.log('bonding')
              await RNBluetoothClassic.pairDevice(address)
              console.log('device Paired')
              await device.connect(connectionOptions)
              console.log('connected')
              await performRead(device)
            } else {
              console.log('Device already paired')
              try {
                console.log('trying to connect to tiltit')
                const connection = await device.connect(connectionOptions);
                if(connection) {
                  console.log('connected')
                  await performRead(device)
                }
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

const stopReading = async(d) => {
    await d.disconnect()
};

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => scanForDevices()}>
        <Text>Look for devices</Text>
      </Pressable>
        <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => setStop(true)}>
          <Text>Stop listening</Text>
        </Pressable>
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
