import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { SearchBar } from "react-native-elements";
import {  StyleSheet, Text,  TouchableOpacity, View,  FlatList,  Alert, Linking, RefreshControl} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis } from "../Common/CallApi";
import { FontAwesome5 } from "@expo/vector-icons";
import Theme from "../constants/Theme";
import * as Location from "expo-location";
const haversine = require('haversine');

//Màn hình trang chủ - danh sách ca bảo hành chờ tiếp nhận
//20210820
const DashBoard = (props) => {
    const navigation = useNavigation();
    const [ListWaiting, setListWaiting] = useState([]);
    const [cacheWaiting, setcacheWaiting] = useState([]);
    const isFocused = useIsFocused();
    const [refreshList, setRefreshList] = useState(false);
    
    useEffect(() => {
        if (isFocused) {
            getListWaiting();
        }
    }, [isFocused]);

    //mở google map
    const openGps = async (item) => {
        if(item.latitude == null || item.longitude == null) { Alert.alert('Tọa độ không xác định.' ); return false}
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${item.latitude},${item.longitude}`;
        const label = "vị trí khách hàng";
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(`Không mở được URI: ${url}`);
            }
        });
    };
    //lấy ra danh sách các ca bảo hành chờ tiếp nhận
    const getListWaiting = async () => {
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
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            let role = 'ktvSH';
            if (userLogin && JSON.parse(userLogin) != null){
                 userName = JSON.parse(userLogin).UserName;
                 if(JSON.parse(userLogin).Role){
                     role = JSON.parse(userLogin).Role;
                 } 
            }
            if(role == 'wdm' || role == 'ktvwdm'){
                setRefreshList(true)
                await GetApis('KTV', 'GetWarrantyOrderPendingStation',
                    {
                        username: userName,
                    },
                    10000
                ).then((newres) => {
                    setRefreshList(false)
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            // data.forEach(element => {
                            //     if(locationCurrent != null && element.latitude != null && element.longitude != null ) {
                            //         element.Distance = haversine({latitude: locationCurrent.coords.latitude, longitude: locationCurrent.coords.longitude}, {latitude: element.latitude, longitude: element.longitude}).toFixed(2);
                            //     }
                            // });
                            //console.log(data);
                            data.sort(function (a, b) { return a.Distance - b.Distance});
                            //console.log(data);
                            setListWaiting(data);
                            setcacheWaiting(data);
                        } else { 
                            setListWaiting([]);
                            setcacheWaiting([]);
                        }
                    } else {
                        Alert.alert('lỗi', newres.ResponseMessenger);
                    }
                });
            }
            else{
                setRefreshList(true)
                await GetApis('KTV', 'GetWarrantyOrderPending',
                    {
                        username: userName,
                    },
                    10000
                ).then((newres) => {
                    setRefreshList(false)
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            data.forEach(element => {
                                if(locationCurrent != null && element.latitude != null && element.longitude != null ) {
                                    element.Distance = haversine({latitude: locationCurrent.coords.latitude, longitude: locationCurrent.coords.longitude}, {latitude: element.latitude, longitude: element.longitude}).toFixed(2);
                                }
                            });
                            data.sort(function (a, b) { return a.Distance - b.Distance});
                            setListWaiting(data);
                            setcacheWaiting(data);
                        } else { 
                            setListWaiting([]);
                            setcacheWaiting([]);
                        }
                    } else {
                        Alert.alert('lỗi', newres.ResponseMessenger);
                    }
                });
            }
        }
        catch (error) {
            setRefreshList(false);
            Alert.alert('Lỗi', error);
        }
    }
    //hàm chuyển sang màn hình WaitingToReceiveDetails
    const DetailsScreen = (item) => {
        navigation.navigate("WaitingToReceiveDetails", item);
    };
    //vẽ 1 item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.item]} onPress={() => DetailsScreen(item)}>
                <View flexDirection="row">
                    <View flex={3} borderRadius={10}>
                        <Text style={[ styles.textColorNormal, { fontSize: 15, fontWeight: "bold", marginTop: 5, marginLeft: 5 }, ]} >{item.WarrantyNumber} </Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.displayDateReceived} </Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.Distance} KM </Text>
                        <View style={[ styles.textColorNormal, { marginTop: 10, marginBottom: 5, marginLeft: 10 }, ]} >
                            <TouchableOpacity onPress={() => openGps(item)}>
                                 <FontAwesome5 name="directions" size={30} style={{ color: "#1671f9" }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View flex={7} marginLeft={8} borderRadius={10}>
                        <Text style={[ styles.textColorNormal, styles.textEdit, { fontSize: 14, fontWeight: "bold" }, ]} >{item.ItemName} </Text>
                        <Text style={[styles.textColorInfo, styles.textEdit]}>{item.CustomerName} - {item.CustomerPhone}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.CustomerAddress} </Text>
                        <Text style={[styles.textColorRed, styles.textEdit]}>{item.Symptom} </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container]}>
            <View style={[styles.viewPanel]}>
                <SearchBar
                    placeholder="Nhập tên khách hàng..."
                    onChangeText={(value) => { var lstWaiting = cacheWaiting.filter( (e) =>
                        e.WarrantyNumber.toLowerCase().indexOf(value.toLowerCase()) != -1 || 
                        e.CustomerName.toLowerCase().indexOf(value.toLowerCase()) != -1 ||
                        e.Symptom.toLowerCase().indexOf(value.toLowerCase()) != -1
                        );
                        setListWaiting(lstWaiting);
                    }}
                    onClear={(e) => {
                        setListWaiting(cacheWaiting);
                    }}
                    value={null}
                    lightTheme={true}
                    containerStyle={{ backgroundColor: "#fff", padding: 2 }}
                    inputStyle={{ height: 30, fontSize: 14 }}
                    inputContainerStyle={styles.inputContainerStyle}
                />
                <View style={{flex: 1}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListWaiting}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.WOIID}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshList}
                            />
                        }
                    />
                </View>
            </View>
        </View>
    );
};
export default DashBoard;
const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "column", backgroundColor: Theme.COLORS.BACKGROUND_COLOR, },
    viewPanel: { flex: 1, borderRadius: 5, opacity: 1, },
    item: { padding: 4, marginHorizontal: 4, marginVertical: 2, marginBottom: 5, backgroundColor: "white", borderRadius: 5, },
    textEdit: { marginTop: 5, marginBottom: 5, marginLeft: 5, },
    textColorNormal: { color: Theme.COLORS.DEFAULTTEXT, },
    textColorInfo: { color: "#1671f9", },
    textColorRed: { color: "red", },
    inputContainerStyle: {height: 30, backgroundColor: "white", borderRadius: 20, borderBottomWidth: 1, borderColor: "#ededed", borderWidth: 1}
});
