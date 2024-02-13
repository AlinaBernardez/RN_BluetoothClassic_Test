import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import base64, { decode } from 'react-native-base64';
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

async function reading(dev) {
    let reading = await dev.read()
    return reading
};

export const performRead = async (d) => {
    let incoming;
    let decoded;
    let message;
    try {
        console.log('Polling for available messages');
        let available = await d.available();
        if (available > 0) {
            d.onDataReceived((data) => {
                incoming = data.data
                decoded = base64.decode(incoming.trimEnd())
                if(decoded.length > 1) {
                    console.log(`Decoded: ${decoded}`)
                    return decoded
                }
            })
        }
    } catch (err) {
        console.log(err);
    }
};





