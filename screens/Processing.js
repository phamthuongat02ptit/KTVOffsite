import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SearchBar } from 'react-native-elements';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Alert, Linking, RefreshControl } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis } from '../Common/CallApi';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import ProcessDetails from "./ProcessDetails";
import AddItemReplace from "./details/AddItemReplace";
import BarCodeScanners from "./details/BarCodeScanners";
import * as Location from "expo-location";

const haversine = require('haversine');
const Stack = createStackNavigator();

//Màn hình danh sách ca bảo hành đang xử lý
//Thuongpv 20210816
const ProcessingComponent = (props) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [ListProcess, setListProcess] = useState([]); //biến danh sách ca bảo hành đang xử lý
    const [cacheProcess, setcacheProcess] = useState([]); //biến danh sách ca bảo hành đang xử lý khi tìm kiếm
    const [refreshList, setRefreshList] = useState(false);
    useEffect(() => {
        if (isFocused) {
            getListProcess();
        };
    }, [props, isFocused]);

    //mở google map
    const openGps = async (loca) => {
        let addres = await Location.geocodeAsync(loca);
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${addres[0].latitude},${addres[0].longitude}`;
        const label = "vị trí hiện tại";
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

    //lấy ra danh sách các ca bảo hành đang xử lý
    const getListProcess = async () => {
        //yêu cầu truy cập vị trí
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Thông báo','Quyền truy cập vị trí đã bị từ chối. Bạn vào cài đặt để thiết lập quyền truy cập vị trí');
            return;
        }
        let locationCurrent = null;
        locationCurrent = await Location.getLastKnownPositionAsync({});
        if(locationCurrent == null){
            locationCurrent = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Low});
        }
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            let roles = await AsyncStorage.getItem('Role');
            //console.log(roles);
            setRefreshList(true)
            await GetApis('KTV', 'GetWarrantyOrderStartProcess',
                {
                    username: userName
                },
                10000
            ).then((newres) => {
                setRefreshList(false)
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                        if(roles != 'wdm' && roles != 'ktvwdm'){
                            data.forEach(element => {
                                if(locationCurrent != null && element.latitude != null && element.longitude != null ) {
                                    element.Distance = haversine({latitude: locationCurrent.coords.latitude, longitude: locationCurrent.coords.longitude}, {latitude: element.latitude, longitude: element.longitude}).toFixed(2);
                                }
                            });
                        }
                        setListProcess(data);
                        setcacheProcess(data);
                    } else { setListProcess([]); setcacheProcess([]);}
                }
            });
        }
        catch (error) {  setRefreshList(false); Alert.alert('Lỗi', error) }
    }
    //chuyển sang màn hình ProcessDetails
    const DetailsOnPress = (obj) => {
        navigation.navigate('ProcessDetails', obj);
    }
    //vẽ một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity style={[styles.item]} onPress={() => DetailsOnPress(item.WOIID)}>
                <View flexDirection="row">
                    <View flex={3} borderRadius={10}>
                        <Text style={[styles.textColorNormal, { fontSize: 15, fontWeight: 'bold', marginTop: 5, marginLeft: 5}]}>{item.WarrantyNumber}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.dspStartProcess}</Text>
                        <Text style={[styles.textColorNormal, styles.textEdit]}>{item.Distance} KM</Text>
                        <Text style={[styles.textColorNormal, { marginTop: 10, marginBottom: 5, paddingLeft: 20}]} onPress={() => openGps(item.CustomerAddress)}>
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
    //vẽ danh sách ca đang xử lý
    return (
        <View style={[styles.container]}>
            <View style={[styles.viewPanel]}>
                <SearchBar
                    placeholder="Nhập tên khách hàng..."
                    onChangeText={(value) => {
                        var lstProcess = cacheProcess.filter(e =>
                            e.WarrantyNumber.toLowerCase().indexOf(value.toLowerCase()) != -1
                            || e.CustomerName.toLowerCase().indexOf(value.toLowerCase()) != -1
                            || e.Symptom.toLowerCase().indexOf(value.toLowerCase()) != -1);
                        setListProcess(lstProcess);
                    }}
                    onClear={(e) => {
                        setListProcess(cacheProcess);
                    }}
                    value={null}
                    lightTheme={true}
                    containerStyle={{ backgroundColor: '#fff', padding: 2 }}
                    inputStyle={{ height: 30, fontSize: 14 }}
                    inputContainerStyle={{ height: 30, backgroundColor: 'white', borderRadius: 20, borderBottomWidth: 1, borderColor: '#ededed', borderWidth: 1 }}
                />
                <FlatList
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                    data={ListProcess}
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
    )
}

const Processing = (props) => {
    return (
        <Stack.Navigator initialRouteName="ProcessingComponent">
            <Stack.Screen
                name="ProcessingComponent"
                component={ProcessingComponent}
                options={{
                    title: "Ca bảo hành đang xử lý",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTab")} >
                            <Ionicons name="ios-menu" size={30} color="white" onPress={() => props.navigation.openDrawer()} />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL, },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold", },
                }}
            />
            <Stack.Screen name="ProcessDetails"
                component={ProcessDetailScreen}
                options={{
                    title: "Ca bảo hành đang xử lý",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("ProcessingComponent")}>
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
            <Stack.Screen name="AddItemReplace"
                component={AddItemReplace}
                options={{
                    title: "Thêm linh kiện thay thế",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("ProcessDetails")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL, },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold", },
                }}
            />
            <Stack.Screen name="BarCodeScanners"
                component={BarCodeScanners}
                options={{
                    title: "Scanner Serial",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("ProcessDetails")}>
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL, },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold", },
                }}
            />
        </Stack.Navigator>
    );
}

//man hinh chi tiet ca bao hanh dang xu ly
function ProcessDetailScreen(props) {
  return (
    <ProcessDetails dataDetail={props.route.params} />
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "column", backgroundColor: Theme.COLORS.BACKGROUND_COLOR, },
    viewPanel: { borderRadius: 5, opacity: 1 },
    item: { padding: 4, marginHorizontal: 4, marginVertical: 2, marginBottom: 5, backgroundColor: "white", borderRadius: 5, },
    textEdit: { marginTop: 5, marginBottom: 5, marginLeft: 5 },
    textColorNormal: { color: Theme.COLORS.DEFAULTTEXT },
    textColorInfo: { color: "#1671f9" },
    textColorRed: { color: "red" }
});

export default Processing;