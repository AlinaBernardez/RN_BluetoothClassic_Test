import * as React from 'react';
import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { dataStreaming, requestPermission } from './useBT.js';


export default function App() {
  const [showThub, setShowThub] = React.useState(false);
  const [inclination, setInclination] = React.useState();

  let connectionOptions = {
    CONNECTION_TYPE: 'binary',
  }

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
              await RNBluetoothClassic.pairDevice(address)
              console.log('device Paired')
              dataStreaming(address)
            } else {
              console.log('Device already paired', address)
              let connection = await thub[0].connect(connectionOptions)
              if(connection) {
                //Check for available data:
                const available = await thub[0].available()
                console.log('Available:', available)
                //Read data:
                let stream = await thub[0].read()
                let myBuffer = []
                let buffer = Buffer.from(stream, 'utf-8')
                console.log(buffer.length, buffer)
                // for (var i = 0; i < buffer.length; i++) {
                //   myBuffer.push(buffer[i]);
                // }
                // console.log(myBuffer)
                // var incomingData = new Uint8Array(myBuffer); // create a uint8 view on the ArrayBuffer
                // var outputData = new Float32Array(incomingData.length); // create the Float32Array for output
                // for (let i = 0; i < incomingData.length; i++) {
                //     outputData[i] = (incomingData[i] - 128) / 128.0; // convert audio to float
                // }
                // console.log(outputData)
              }
            }
          } else {
            console.log('THUB not found')
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
