import RNBluetoothClassic, {BluetoothDevice} from 'react-native-bluetooth-classic';
import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';

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
}

export const dataStreaming = async (ad) => {
    const device = await RNBluetoothClassic.getConnectedDevice(ad)
    console.log(device)
    try {      
        const connectedDevice = await device.connect()
        console.log(connectedDevice)
    } catch (error) {
        console.log('Not able to connect')
    }
}



