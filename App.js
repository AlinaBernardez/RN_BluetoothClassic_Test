import * as React from 'react';
import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { performRead, requestPermission } from './useBT.js';
import base64, { decode } from 'react-native-base64';

let device = null;
let decoded = 90;

export default function App() {
  const [showThub, setShowThub] = React.useState(false);
  const [inclination, setInclination] = React.useState(decoded);
  // const [device, setDevice] = React.useState(null);
  const [stop, setStop] = React.useState(false);

  let address
  let bonded
  let interval

  React.useEffect(() => {
    setInclination((90 - parseFloat(decoded)).toFixed(2))
  }, [decoded])

  // original config that doesn't work (keep for accidents)
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
            console.log(device.address)
            if(!bonded) {
              console.log('bonding')
              await RNBluetoothClassic.pairDevice(address)
              console.log('device Paired')
              const connection = await device.connect(connectionOptions)
              if(connection) {
                console.log('connected')
                interval = setInterval(async () => {
                  reading = await device.read()
                  if(reading) {
                    decoded = base64.decode(reading.trimEnd())
                    if(decoded.length > 1) {
                      setInclination((90 - parseFloat(decoded)).toFixed(2))
                      console.log(`Client decoded reading: ${decoded}`)
                    }
                  }
                }, 100)
                reading = await performRead(device)
                console.log('Client:', reading)
              }
            } else {
              console.log('Device already paired')
              try {
                console.log('Trying to connect to tiltit')
                const connection = await device.connect(connectionOptions);
                if(connection) {
                  console.log('connected')
                  // interval = setInterval(async () => {
                  //   reading = await device.read()
                  //   if(reading) {
                  //     decoded = base64.decode(reading.trimEnd())
                  //     if(decoded.length > 1) {
                  //       setInclination((90 - parseFloat(decoded)).toFixed(2))
                  //       console.log(`Client decoded reading: ${decoded}`)
                  //     }
                  //   }
                  // }, 100)
                  // reading = await performRead(device)
                  // console.log('Client:', reading)
                }
              } catch (err) {
                console.error('THUB not connected', err);
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
    clearInterval(interval)
    console.log('Disconnected and cleared')
};

  return (
    <View style={styles.container}>
      <Text>Tilt angle: {inclination}</Text>
      <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => scanForDevices()}>
        <Text>Connect & read</Text>
      </Pressable>
        <Pressable style={{backgroundColor: 'tomato', padding: 20, margin: 15}} onPress={() => stopReading(device)}>
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
