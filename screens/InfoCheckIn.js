import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Text, View, StyleSheet, Dimensions, Alert, TouchableOpacity, Image } from 'react-native';
import { Button } from "react-native-paper";
import MapView, { Marker, Polyline }  from 'react-native-maps';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { GetApis, PostApis } from "../Common/CallApi";
import Theme from '../constants/Theme';
import { ScrollView } from "react-native-gesture-handler";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { APIURL, APILOCAL, AUTHORIZATION } from "@env";
import { Camera } from "expo-camera";
const haversine = require('haversine');

//màn hình thông tin chấm công
//Thuongpv 20210809
const InfoCheckIn = (props) => {
    const navigation = useNavigation();
    const[distanceCurr, setDistanceCurr] = useState(0);
    const[infoProcess, setInfoProcess] = useState({}); // thông tin ca bảo hành đang xử lý
    const[address, setAddress] = useState();
    const[uriImage, setUriImage] = useState({});
    let bodyFormData = new FormData();
    const[coordinatesCurr, setCoordinatesCurr] = useState({latitude: 0, longitude: 0});
    const[coordinatesCtm, setCoordinatesCtm] = useState({latitude: 0, longitude: 0});
    const[paramForm, setParamForm] = useState({});
    useEffect(() => {
        getInfoProcess();
    }, []);
    //lấy thông tin ca bảo hành đang xử lý
    const getInfoProcess = async () => {
        try {
            //kiểm tra xem thiết bị đã được bật định vị chưa?
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Thông báo','Quyền truy cập vị trí đã bị từ chối. Bạn vào cài đặt để thiết lập quyền truy cập vị trí');
                return;
            }
            let location = null;
            location = await Location.getLastKnownPositionAsync({});
            if(location != null){
                setCoordinatesCurr({latitude: location.coords.latitude, longitude: location.coords.longitude})
            }else{
                location = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Low});
                if(location == null){Alert.alert('Thông báo','Không tìm thấy tọa độ hiện tại của bạn.');}
                setCoordinatesCurr({latitude: location.coords.latitude, longitude: location.coords.longitude})
            }
            //lấy ra địa chỉ bưu điện theo tạo độ hiện tại
            let [addr] = await Location.reverseGeocodeAsync({
                latitude : location.coords.latitude,
                longitude : location.coords.longitude
            });
            let newAddress = "" + addr.name + " " + addr.street + ", " + addr.city;
            setAddress(newAddress);

            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetWarrantyOrderStartProcess',
                {
                    username: userName,
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined || data != null) {
                        setInfoProcess(data[0]);
                        let latitudes = parseFloat(data[0].latitude);
                        let longitudes = parseFloat(data[0].longitude);
                        setCoordinatesCtm({latitude: latitudes, longitude:  longitudes});
                        let newDistance = haversine({latitude: location.coords.latitude, longitude: location.coords.longitude}, {latitude: latitudes, longitude: longitudes}).toFixed(2);
                        setDistanceCurr(newDistance);
                    } else { setInfoProcess({}); }
                }
            });
        }
        catch (error) {
            Alert.alert('Thông báo', 'Lỗi lấy dữ liệu ca bảo hành đang xử lý');
        }
    }
    //thông báo xác nhận
    const confirmAlert = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chấm công không?',
            [{
                text: 'Đồng ý',
                style: { color: Theme.COLORS.ERROR },
                onPress: () => {timeKeepingPost()},
            },
            {
                text: 'Không',
                onPress: () => {
                    return null;
                },
            },
            ],
            { cancelable: false },
        );
    }

    //Kiểm tra xem nếu không có ca đang xử lý thì không được chấm công
    const checkIsProcessing = () => {
        if(Object.values(infoProcess).length === 0){
            { Alert.alert('Thông báo', 'Bạn chưa bắt đầu xử lý ca nên không thể chấm công.' ); return false}
        } else {
            //console.log(infoProcess);
            confirmAlert();
        }
    }
    //thực hiện chấm công
    const timeKeepingPost = async () => {
        try{
            if(coordinatesCurr == {latitude: 0, longitude: 0}){
                Alert.alert(`Lỗi`, 'Tọa độ chưa được xác định.', [{ text: "Đóng" }],);
                return false;
            }
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            if(Object.values(paramForm).length === 0) {Alert.alert(`Lỗi`, 'Bạn chưa chụp ảnh.', [{ text: "Đóng" }],); return false;}
            bodyFormData.append('', paramForm);
            if(bodyFormData == null) {Alert.alert(`Lỗi`, 'Lỗi bodyFormData truyền vào.', [{ text: "Đóng" }],); return false;}
            if(distanceCurr == 0) {Alert.alert(`Lỗi`, 'Khoảng cách không xác định.', [{ text: "Đóng" }],); return false;}
            //if(distanceCurr*1000 > 500) {Alert.alert(`Lỗi`, 'Khoảng cách không được vượt quá 500m.', [{ text: "Đóng" }],); return false;}
            axios({
                    url: `${APIURL}/KTV/KTVCheckIn?userName=${userName}&latitude=${coordinatesCurr.latitude}&lonitude=${coordinatesCurr.longitude}&distance=${distanceCurr}`,
                    method: 'POST',
                    data: bodyFormData,
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `${AUTHORIZATION}` } })
                .then(function (res) {
                    if (res && res.data.ResponseStatus == 'OK') {
                        Alert.alert(`Thông báo`, "Chấm công thành công", [{ text: "Đóng" }],);
                        navigation.navigate('TimekeepingComponent');
                    } else {
                        setTimeout(() => {
                            Alert.alert(`Lỗi`, res.data.ResponseMessenger, [{ text: "Đóng" }],);
                        }, 10);
                    } })
                .catch(function (error) {
                    setTimeout(() => {
                        Alert.alert(error);
                    }, 10);
                });
        }
        catch (error) {
            Alert.alert(error);
        }
    }
    //hàm chụp ảnh
    const pickImage = async () => {
        let isPermission = await ImagePicker.getCameraPermissionsAsync();
        if (!isPermission.granted) {
            let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert("Bạn chưa cấp quyền cho ứng dụng.");
                return;
            }
        }
        let result = await ImagePicker.launchCameraAsync({ allowsEditing: false, aspect: [4, 3], quality: 0.1, });
        if (!result.cancelled) {
            setUriImage(result);
            const filename = result.uri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            setParamForm({
                uri:
                    Platform.OS === "android"
                        ? result.uri
                        : result.uri.replace("file://", ""),
                name: filename,
                type,
            });
        }
    };
    return (
        <View style={{flex: 1, flexDirection: 'column'}}>
            <View style={{flexDirection: 'row'}}>
                <View style={{flex: 2, borderRightWidth: 1, borderColor: '#e0e0e0',  justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity style={{width: '100%', alignItems: 'center', justifyContent: 'center'}} onPress={() => {pickImage()}}>
                        {( Object.values(uriImage).length === 0) 
                        ? <Text><FontAwesome name="camera" size={80} color="#818181" /></Text> 
                        : <Image style={{width: (150 * uriImage.width / uriImage.height), height:150}} source={{uri: uriImage.uri}} />}
                    </TouchableOpacity>
                </View>
                <View style={{flex: 3}}>
                    <Text style={{fontSize: 20, fontWeight: 'bold', marginLeft: 70, marginTop: 5, color: '#818181'}}>Thông tin ca</Text>
                    <View style={{flexDirection: 'row',  margin: 5, borderBottomWidth: 1}}>
                        <FontAwesome name="user" size={24} color="#818181" />
                        <Text style={{marginLeft: 15, color: '#818181'}}>{infoProcess.TechnicianName}</Text>
                    </View>
                    <View style={{flexDirection: 'row', margin: 5, borderBottomWidth: 1}}>
                        <FontAwesome name="wrench" size={20} color="#818181" />
                        <Text style={{marginLeft: 15, color: '#818181'}}>{infoProcess.WarrantyNumber}</Text>
                    </View>
                    <View style={{flexDirection: 'row', margin: 5, borderBottomWidth: 1, paddingRight: 20}}>
                        <Ionicons name="location" size={24} color="#818181" />
                        <Text style={{marginLeft: 10, color: '#818181'}}>{address}</Text>
                    </View>
                    <View style={{flexDirection: 'row',  margin: 5, borderBottomWidth: 1}}>
                        <FontAwesome name="plane" size={24} color="#818181" />
                        <Text style={{marginLeft: 15, color: '#818181'}}>{distanceCurr} KM</Text>
                    </View>
                </View>
            </View>
            <View style={{flex: 1}}>
                <MapView
                    style={styles.map}
                    region={{
                        latitude: coordinatesCurr.latitude,
                        longitude: coordinatesCurr.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421
                    }}
                    provider="google"
                >
                    <Marker coordinate={coordinatesCurr} />
                    <Marker coordinate={coordinatesCtm} />

                    <Polyline
                        coordinates={[coordinatesCurr, coordinatesCtm]}
                        strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                        strokeColors={['#7F0000']}
                        strokeWidth={6}
                    />

                </MapView>
            </View>
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5}}>
                <Button color='white' onPress={checkIsProcessing}>CHẤM CÔNG</Button>
            </View>
        </View>
    );
  
}
export default InfoCheckIn;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center"
	},
	map: {
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height*0.5
	}
})