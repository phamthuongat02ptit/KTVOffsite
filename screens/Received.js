import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SearchBar } from 'react-native-elements';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Alert, Linking, RefreshControl } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis } from '../Common/CallApi';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import Theme from '../constants/Theme';
import ReceivedDetails from "./ReceivedDetails";
import * as Location from "expo-location";

const haversine = require('haversine');
const Stack = createStackNavigator();

//màn hình danh sách ca bảo hành đã tiếp nhận
//Thuongpv 20210812
const ReceivedComponent = (props) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [ListReceived, setListReceived] = useState([]); //Biến danh sách ca bảo hành đã tiếp nhận
    const [cacheReceived, setCacheReceived] = useState([]); //Biến danh sách ca bảo hành khi tìm kiếm
    const [refreshList, setRefreshList] = useState(false);

    useEffect(() => {
        if (isFocused) {
            getListReceived();
        };
    }, [props, isFocused]);

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

    //lấy ra danh sách các ca bảo hành đã tiếp nhận
    const getListReceived = async () => {
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
            let roles = await AsyncStorage.getItem('Role');
            if(roles == "ktvwdm"){
                var userLogin = await AsyncStorage.getItem('userLogin');
                var userName = '';
                if (userLogin && JSON.parse(userLogin) != null) {userName = JSON.parse(userLogin).UserName;}
                setRefreshList(true)
                await GetApis('KTV', 'GetWarrantyOrderWorkingStation', { username: userName }, 10000)
                    .then((newres) => {
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
                                setListReceived(data);
                                setCacheReceived(data);
                            } else { setListReceived([]); setCacheReceived([]);}
                        }
                    });
            }
            if(roles != "ktvwdm" && roles != "wdm"){
                var userLogin = await AsyncStorage.getItem('userLogin');
                var userName = '';
                if (userLogin && JSON.parse(userLogin) != null){userName = JSON.parse(userLogin).UserName}
                setRefreshList(true)
                await GetApis('KTV', 'GetWarrantyOrderWorking', { username: userName }, 10000 )
                    .then((newres) => {
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
                                setListReceived(data);
                                setCacheReceived(data);
                            } else { setListReceived([]); setCacheReceived([]) }
                        }
                    });
            }
        }
        catch (error) {
            Alert.alert('Lỗi', error)
        }
    }
    
    //hàm chuyển sang màn hình ReceivedDetails
    const DetailsOnPress = (obj) => {
        navigation.navigate('ReceivedDetails', obj);
    }
    
    //vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.item]} onPress={() => DetailsOnPress(item)}>
                <View flexDirection="row">
                    <View flex={3} borderRadius={10}>
                        <Text style={[styles.textColorNormal, { fontSize: 15, fontWeight: 'bold', marginTop: 5, marginLeft: 5}]}>{item.WarrantyNumber}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.dspDateReceived}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.Distance} KM</Text>
                        <Text style={[styles.textColorNormal, { marginTop: 10, marginBottom: 5, paddingLeft: 20}]} onPress={() => openGps(item)}>
                            <FontAwesome5 name="directions" size={30} style={{color: "#1671f9"}} />
                        </Text>
                    </View>
                    <View flex={7} marginLeft={8} borderRadius={10}>
                        <Text style={[styles.textColorNormal, styles.textEdit, { fontSize: 14, fontWeight: 'bold'}]}>{item.ItemName}</Text>
                        <Text style={[styles.textColorInfo, styles.textEdit]}>{item.CustomerName} - {item.CustomerPhone}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.CustomerAddress}</Text>
                        <Text style={[styles.textColorRed, styles.textEdit]}>{item.Symptom}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    //vẽ màn hình danh sách ca bảo hành đã tiếp nhận
    return (
        <View style={[styles.container]}>
            <View style={[styles.viewPanel]}>
                <SearchBar
                    placeholder="Nhập tên khách hàng..."
                    onChangeText={(value) => {
                        var lstReceived = cacheReceived.filter(e =>
                            e.WarrantyNumber.toLowerCase().indexOf(value.toLowerCase()) != -1
                            || e.CustomerName.toLowerCase().indexOf(value.toLowerCase()) != -1
                            || e.Symptom.toLowerCase().indexOf(value.toLowerCase()) != -1);
                        setListReceived(lstReceived);
                    }}
                    onClear={(e) => {
                        setListReceived(cacheReceived);
                    }}
                    value={null}
                    lightTheme={true}
                    containerStyle={{ backgroundColor: '#fff', padding: 2 }}
                    inputStyle={{ height: 30, fontSize: 14 }}
                    inputContainerStyle={{ height: 30, backgroundColor: 'white', borderRadius: 20, borderBottomWidth: 1, borderColor: '#ededed', borderWidth: 1 }}
                />
                <View style={{flex: 1}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListReceived}
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
    )
}

const Received = (props) => {
    return (
        <Stack.Navigator initialRouteName="ReceivedComponent">
            <Stack.Screen
                name="ReceivedComponent"
                component={ReceivedComponent}
                options={{
                    title: "Ca bảo hành đã tiếp nhận",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTab")}>
                            <Ionicons name="ios-menu" size={30} color="white" onPress={() => props.navigation.openDrawer()}/>
                        </TouchableOpacity>
                    ),
                    headerStyle: {
                        backgroundColor: Theme.COLORS.GREEN_PORTAL,
                    },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            />
            <Stack.Screen name="ReceivedDetails"
                component={ReceivedDetailScreen}
                options={{
                title: "Chi tiết đã tiếp nhận",
                headerLeft: () => (
                    <TouchableOpacity
                    style={{ marginHorizontal: 10 }}
                    onPress={() => props.navigation.navigate("ReceivedComponent")}
                    >
                    <Ionicons name="chevron-back" size={24} color="white"/>
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: Theme.COLORS.GREEN_PORTAL,
                },
                headerTitleAlign: "center",
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                }}
            />
        </Stack.Navigator>
    );
}
//man hinh chi tiet ca bao hanh da tiep nhan
function ReceivedDetailScreen(props) {
  return (
    <ReceivedDetails dataDetail={props.route.params} />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "column", backgroundColor: Theme.COLORS.BACKGROUND_COLOR },
    viewPanel: { flex: 1, borderRadius: 5, opacity: 1 },
    item: { padding: 4, marginHorizontal: 4, marginVertical: 2, marginBottom: 5, backgroundColor: "white", borderRadius: 5 },
    textEdit: { marginTop: 5, marginBottom: 5, marginLeft: 5 },
    textColorNormal: { color: Theme.COLORS.DEFAULTTEXT },
    textColorInfo: { color: "#1671f9" },
    textColorRed: { color: "red" }
});

export default Received;