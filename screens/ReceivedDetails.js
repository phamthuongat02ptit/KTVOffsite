import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis } from '../Common/CallApi';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import { Button } from 'react-native-paper';
import Communications from 'react-native-communications';
import moment from "moment";
import * as Location from "expo-location";

//màn hình chi tiết ca bảo hành đã tiếp nhận
//Thuongpv 20210816
const ReceivedDetails = (props) => {
    const navigation = useNavigation();
    console.log(props.dataDetail);
    const [latitude, setLatitude] = useState(props.dataDetail.latitude);
    const [longitude, setLongitude] = useState(props.dataDetail.longitude);
    const [address, setAddress] = useState(props.dataDetail.CustomerAddress);
    const [distance, setDistance] = useState(props.dataDetail.Distance);
    const timeReceived = moment(props.dataDetail.DateReceived).format("hh:mm:ss DD/MM/yyyy");
    //mở google map
    const openGps = () => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${latitude},${longitude}`;
        const label = address;
        const url = Platform.select({ ios: `${scheme}${label}@${latLng}`, android: `${scheme}${latLng}(${label})` });
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert('Lỗi', 'Không mở được GoogleMap');
                //console.log('Không mở được GoogleMap');
            }
        });
    };
   
    //hàm bắt đầu xử lý ca bảo hành
    var StartProcessOnPress = async() => {
        //yêu cầu truy cập vị trí
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo','Quyền truy cập vị trí đã bị từ chối. Bạn vào cài đặt để thiết lập quyền truy cập vị trí');
            return;
        }
        let locationCurrent = null;
        locationCurrent = await Location.getLastKnownPositionAsync({});
        if(locationCurrent == null){
            //console.log("phải dùng hàm getCurrentPositionAsync");
            locationCurrent = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Low});
        }
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null) {userName = JSON.parse(userLogin).UserName;}
            if(locationCurrent == null) { Alert.alert('Lỗi', 'Tọa độ hiện tại không xác định.' ); return false}
            if(locationCurrent.coords.latitude == null || locationCurrent.coords.longitude == null || distance == 0){Alert.alert('Lỗi',"không định vị được vị trí");}
            let roles = await AsyncStorage.getItem('Role');
            await GetApis('KTV', 'StartProcess',
                {
                    WOIID: props.dataDetail.WOIID,
                    latitude: locationCurrent.coords.latitude,
                    lonitude: locationCurrent.coords.longitude,
                    distance: distance,
                    loginUser: userName
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    Alert.alert('Thông báo','Ca bảo hành bắt đầu xử lý');
                    navigation.navigate('ReceivedComponent');
                } else { Alert.alert('Thông báo', newres.ResponseMessenger);}
            });
        }
        catch (error) { Alert.alert('Lỗi','Không thể bắt đầu xử lý ca bảo hành'); }
    }
    //thông báo xác nhận
    const confirmAlert = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc bắt đầu xử lý không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {StartProcessOnPress()}, },
            { text: 'Không', onPress: () => { return null } } ],
            { cancelable: false },
        );
    }

    return (
        <ScrollView>
            <View style={{margin: 5, borderRadius: 7, backgroundColor: "#E4E4E4"}}>
                <View flexDirection="row">
                    <View style={{margin: 10}} flex={1}>
                        <FontAwesome name="phone" size={45} color="black" onPress={() => Communications.phonecall(props.dataDetail.CustomerPhone, true)} />
                    </View>
                    <View flex={7}>
                        <View flexDirection="row" justifyContent="space-between" style={{ marginTop: 10, marginBottom: 8, marginRight: 10}}>
                            <View style={{flex: 5, paddingRight: 10}}><Text style={{fontWeight: 'bold', fontSize: 16, color: Theme.COLORS.DEFAULTTEXT}}>{props.dataDetail.CustomerName}</Text></View>
                            <View style={{flex: 2, alignItems: 'flex-end'}}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>{props.dataDetail.strDateReceived}</Text></View>
                        </View>
                        <Text style={{fontSize: 15, color: Theme.COLORS.DEFAULTTEXT}}>{props.dataDetail.CustomerPhone}</Text>
                    </View>
                </View>
                <View flexDirection="row" style={{marginBottom: 10}}>
                    <View style={{margin: 10}} flex={1}>
                        <FontAwesome5 name="directions" size={40} style={{color: "#1671f9"}} onPress={() => openGps()} />
                    </View>
                    <View flex={7}>
                        <View flexDirection="row" justifyContent="space-between" style={{ marginTop: 10, marginBottom: 8, marginRight: 10}}>
                            <Text style={{fontWeight: 'bold', fontSize: 16, color: Theme.COLORS.DEFAULTTEXT}}>{props.dataDetail.ProvinceName}</Text>
                            <Text style={{color: Theme.COLORS.DEFAULTTEXT}}>{distance} KM</Text>
                        </View>
                        <Text style={{color: Theme.COLORS.DEFAULTTEXT}}>{props.dataDetail.CustomerAddress}</Text>
                    </View>
                </View>
            </View>
            <View style={{backgroundColor: "#E4E4E4", margin: 5, borderRadius: 7, padding: 10}}>
                <Text style={{color: Theme.COLORS.DEFAULTTEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 7}}>{props.dataDetail.ItemName}</Text>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={13}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Model {props.dataDetail.ItemCode}</Text></View>
                    <View flex={2} style={{alignItems: 'flex-end'}}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>X{props.dataDetail.QuantityReceived}</Text></View>
                </View>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Phiếu bảo hành {props.dataDetail.WarrantyNumber}</Text></View>
                </View>
                <View flexDirection="row">
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: "red"}}>{props.dataDetail.Symptom}</Text></View>
                </View>
            </View>
            <View style={{backgroundColor: "#E4E4E4", margin: 5, borderRadius: 7, padding: 10}}>
                <Text style={{color: Theme.COLORS.DEFAULTTEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 7}}>{props.dataDetail.TechnicianName}</Text>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Ngày nhận: {timeReceived}</Text></View>
                    {/* <View flex={5} style={{alignItems: 'flex-end'}}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>{timeReceived}</Text></View> */}
                </View>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Ghi chú: {props.dataDetail.TechnicianReceivedNote}</Text></View>
                </View>
            </View>
            <Button 
                style={{backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10}}
                onPress={() => { confirmAlert() }}>
                <Text style={{color: "white", fontWeight: "bold"}}>BẮT ĐẦU XỬ LÝ</Text>
            </Button>
        </ScrollView>
    );
}
export default ReceivedDetails;