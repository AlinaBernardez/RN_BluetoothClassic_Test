import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import { TextEncoder } from 'text-decoding';

async function requestAndroid31Permission() {
    const bluetoothScanPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
            title: 'Scan BT connection',
            message:'App requires BT connection scanning',
            buttonNeutral: 'Ask Me Later"',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
        }
    )
    const bluetoothConnectPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
            title: 'Scan BT connection',
            message:'App requires BT connection.',
            buttonNeutral: 'Ask Me Later"',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
        }
    )
    const bluetoothFineLocationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
        title: 'Access fine location required for discovery',
        message: 'In order to perform discovery, you must enable/allow ',
        buttonNeutral: 'Ask Me Later"',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK'
        }
    )
    return (
        bluetoothScanPermission == 'granted' &&
        bluetoothConnectPermission == 'granted' &&
        bluetoothFineLocationPermission == 'granted'
    )
};

export const requestPermission = async () => {
    if(Platform.OS == 'android') {
        if(ExpoDevice.platformApiLevel < 31) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                title: 'Access fine location required for discovery',
                message: 'In order to perform discovery, you must enable/allow location',
                buttonNeutral: 'Ask Me Later"',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK'
                }
            )
            return granted === PermissionsAndroid.RESULTS.GRANTED
        } else {
            const isAndroid31PermissionGranted = await requestAndroid31Permission();
            return isAndroid31PermissionGranted; 
        }
    } else {
        return true
    }
};

const conversion = (string) => {
    let encoded = new TextEncoder().encode(string)
    // let incoming = Buffer.from(data.data, 'utf-8')
    // let incomingData = new Uint8Array(incoming)
    // console.log(incomingData)
    // let arrayBuffer = new ArrayBuffer(8)
    // new Uint8Array(arrayBuffer).set(incomingData)
    // let view = new DataView(arrayBuffer).getFloat32(0, false)

    let incomingArray = Array.from(encoded)
    // for(let i = 0; i < encoded.length; i++) {
    //     incomingArray[i] = encoded[i]
    // }
    incomingArray.pop()
    let uint8 = new Uint8Array(incomingArray)
    let floats = new Float32Array(uint8.buffer)
    console.log(floats)
}

export const performRead = async (d) => {
    try {
        console.log('Polling for available messages');
        let available = await d.available();
        console.log(`There is data available [${available}], attempting read`);
        if (available > 0) {
                let message = await d.read();
                console.log(message)
                d.onDataReceived((data) => {
                    let incoming = data.data
                    conversion(incoming)
                })
        }
    } catch (err) {
        console.log(err);
    }
};

export const stopReading = async(d) => {
    await d.disconnect()
};

