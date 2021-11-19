import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Alert, TextInput, FlatList, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import Modal from 'react-native-modal';
import Theme from '../../constants/Theme';
import { ScrollView } from "react-native-gesture-handler";
import { GetApis } from "../../Common/CallApi";
import { SearchBar } from "react-native-elements";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Menu, Divider, Provider } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';

const Stack = createStackNavigator();

//màn hình quét serial
//Thuongpv 20210823
const BarCodeScanners = ({route}) => {
    const navigation = useNavigation();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [text, setText] = useState('Quét mã của bạn');
    const [serialNumber, setSerialNumber] = useState(route.params.serialNumber); //số serial

    const askForCameraPermission = () => {
        (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        })()
    }

    // Request Camera Permission
    useEffect(() => {
        askForCameraPermission();
    }, []);

    //hàm quay lại màn hình chi tiết ca xử lý
    const gobacks = () => {
        route.params.setSerialNumber(text);
        navigation.navigate('ProcessDetails');
    }

    // What happens when we scan the bar code
    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setText(data);
    };

    // Check permissions and return the screens
    if (hasPermission === null) {
        return (
        <View style={styles.container}>
            <Text>Requesting for camera permission</Text>
        </View>)
    }
    if (hasPermission === false) {
        return (
        <View style={styles.container}>
            <Text style={{ margin: 10 }}>No access to camera</Text>
            <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
        </View>)
    }

    // Return the View
    return (
        <View style={styles.container}>
        <View style={styles.barcodebox}>
            <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: 400, width: 400 }} />
        </View>
        <Text style={styles.maintext}>{text}</Text>

        {/* {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />} */}
        {scanned && 
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5}}>
                <Button color='white' onPress={() => {setScanned(false); gobacks();}}>LẤY MÃ</Button>
            </View>}
        </View>
    );
};
export default BarCodeScanners;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato'
  }
});
