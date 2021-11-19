import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Alert, Linking, TextInput } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetApis } from '../Common/CallApi';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import Theme from '../constants/Theme';
import moment from "moment";
import { Button } from 'react-native-paper';
import Communications from 'react-native-communications';
import Modal from 'react-native-modal';
import * as Location from "expo-location";
const haversine = require('haversine');

//màn hình chi tiết ca xử lý chờ tiếp nhận
//Thuongpv 20210816
const WaitingToReceiveDetails = (props) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [objDetail, setObjDetail] = useState(props.dataDetail); //đối tượng ca bảo hành chờ tiếp nhận
    const [objReceiveProcess, setObjReceiveProcess] = useState({WOIID : props.dataDetail.WOIID, note: ''}); //đối tượng param tiếp nhận bảo hành
    var strDateReceived = moment(props.dataDetail.DateReceived).format("DD/MM/YYYY");
    const [role, setRole] = useState("ktvSH"); //đối tượng ca bảo hành chờ tiếp nhận
    const [isModalVisible, setModalVisible] = useState(false);
    const [listUserStation, setListUserStation] = useState([]);//danh sách user kỹ thuật viên của trạm

    useEffect(() => {
        if (isFocused) {
            getRole();
        }
    }, [isFocused]);
    
    //lấy ra vai trò user
    const getRole = async () =>{
        let userLogin = await AsyncStorage.getItem('userLogin');
        if(userLogin && JSON.parse(userLogin) != null){
            if(JSON.parse(userLogin).Role){
                setRole(JSON.parse(userLogin).Role);
            }
        }
    }

    const getListKTV = async () => {
        let userLogin = await AsyncStorage.getItem('userLogin');
        let userName = '';
        if (userLogin && JSON.parse(userLogin) != null){ userName = JSON.parse(userLogin).UserName }
        await GetApis('KTV', 'GetListUserStation', { username: userName, }, 10000 )
            .then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                          setListUserStation(data);
                    }
                }
            });
    }

    //mở app google map
    const openGps = () => {
        if(objDetail.latitude == null || objDetail.longitude == null) { Alert.alert('Tọa độ không xác định.' ); return false}
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${objDetail.latitude},${objDetail.longitude}`;
        const label = "Vị trí khách hàng";
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
    //hàm tiếp nhận bảo hành cho tài khoản ktv sunhouse
    var ReceiveProcessOnPress = async() => {
        try {
            if(objDetail.latitude == null || objDetail.longitude == null) { Alert.alert('Lỗi', 'Tọa độ không xác định.' ); return false}
            let userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null) {userName = JSON.parse(userLogin).UserName;}
            await GetApis('KTV', 'ReceiveProcess',
                {
                    WOIID: objReceiveProcess.WOIID,
                    note: objReceiveProcess.note,
                    username: userName
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    Alert.alert("Tiếp nhận thành công");
                    navigation.navigate("HomeTabBar");
                } else {Alert.alert("Lỗi, không thể tiếp nhận");}
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }
    //hàm tiếp nhận bảo hành cho tài khoản ktv của trạm
    var ReceiveProcessStation = async() => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = '';
            if (userLogin && JSON.parse(userLogin) != null) {userName = JSON.parse(userLogin).UserName;}
            await GetApis('KTV', 'ReceiveProcessStation',
                {
                    WOIID: objReceiveProcess.WOIID,
                    note: objReceiveProcess.note,
                    username: userName
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    Alert.alert("Tiếp nhận thành công");
                    navigation.navigate("HomeTabBar");
                } else {Alert.alert("Lỗi", newres.ResponseMessenger);}
            }); 
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }
    //thông báo xác nhận cho tài khoản ktv của trạm
    const confirmAlertStation = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc tiếp nhận không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {ReceiveProcessStation()}, },
            { text: 'Không', onPress: () => { return null } } ],
            { cancelable: false },
        );
    }

    //thông báo xác nhận
    const confirmAlert = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc tiếp nhận không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {ReceiveProcessOnPress()}, },
            { text: 'Không', onPress: () => { return null } } ],
            { cancelable: false },
        );
    }

    //thông báo xác nhận xử lý ca bảo hành
    const confirmProcessing = () => {
        Alert.alert( 'Xác nhận', 'Bạn có muốn bắt đầu xử lý ca này không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {StartProcessingStation()}, },
            { text: 'Không', onPress: () => { return null } } ],
            { cancelable: false },
        );
    }

    //hàm bắt đầu xử lý ca bảo hành đối với tài khoản trưởng trạm
    var StartProcessingStation = async() => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = '';
            if (userLogin && JSON.parse(userLogin) != null) {userName = JSON.parse(userLogin).UserName;}
            if(props.dataDetail.latitude == null || props.dataDetail.longitude == null || props.dataDetail.Distance == null){
               Alert.alert("Không tìm thấy định vị của bạn"); 
            }
            await GetApis('KTV', 'StartProcess',
                {
                    WOIID: props.dataDetail.WOIID,
                    latitude: props.dataDetail.latitude,
                    lonitude: props.dataDetail.longitude,
                    distance: props.dataDetail.Distance,
                    loginUser: userName
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    Alert.alert('Thông báo','Ca bảo hành bắt đầu xử lý');
                    navigation.navigate("HomeTabBar");
                } else {Alert.alert('Thông báo', newres.ResponseMessenger);}
            });
            
        }
        catch (error) { Alert.alert('Lỗi','Không thể bắt đầu xử lý ca bảo hành'); }
    }

    //thông báo xác nhận giao việc cho kỹ thuật viên
    const confirmAssign = (user) => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc giao việc cho kỹ thuật viên này không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {AssignKTV(user)}, },
            { text: 'Không', onPress: () => { return null } } ],
            { cancelable: false },
        );
    }
    //hàm giao việc cho kỹ thuật viên
    const AssignKTV = async (user) => {
        try {
            await GetApis('KTV', 'AssignKTVStation',
                {
                    WOIID: objReceiveProcess.WOIID,
                    note: objReceiveProcess.note,
                    username: user
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    Alert.alert("Giao việc thành công");
                    navigation.navigate("HomeTabBar");
                } else {Alert.alert("Lỗi, không thể giao việc cho kỹ thuật viên này");}
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
        setModalVisible(false);
    }

    //vẽ 1 item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {confirmAssign(item.UserName)}}>
                <View style={{flexDirection:'row', backgroundColor: Theme.COLORS.GREEN_PORTAL, marginTop: 10, padding: 7, borderRadius: 3}}>
                    <Text style={{flex: 2, color: 'white', fontWeight:'bold'}}>{item.FullName}</Text>
                    <Text style={{flex: 1, color: 'white', alignItems:'flex-end', fontWeight:'bold'}}>{item.PhoneNumber}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <ScrollView>
            <View style={{margin: 5, borderRadius: 7, backgroundColor: "#E4E4E4"}}>
                <View flexDirection="row">
                    <View style={{margin: 10}} flex={1}>
                        <FontAwesome name="phone" size={45} color="black" onPress={() => Communications.phonecall(objDetail.CustomerPhone, true)} />
                    </View>
                    <View flex={7}>
                        <View flexDirection="row" style={{ marginTop: 10, marginBottom: 8, marginRight: 10}}>
                            <View style={{flex: 5, paddingRight: 10}}><Text style={{fontWeight: 'bold', fontSize: 16, color: Theme.COLORS.DEFAULTTEXT}}>{objDetail.CustomerName}</Text></View>
                            <View style={{flex: 2, alignItems: 'flex-end'}}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>{strDateReceived}</Text></View>
                        </View>
                        <Text style={{fontSize: 13, color: Theme.COLORS.DEFAULTTEXT}}>{objDetail.CustomerPhone}</Text>
                    </View>
                </View>
                <View flexDirection="row" style={{marginBottom: 10}}>
                    <View style={{margin: 10}} flex={1}>
                        <FontAwesome5 name="directions" size={40} style={{color: "#1671f9"}} onPress={() => openGps()} />
                    </View>
                    <View flex={7}>
                        <View flexDirection="row" justifyContent="space-between" style={{ marginTop: 10, marginBottom: 8, marginRight: 10}}>
                            <Text style={{fontWeight: 'bold', fontSize: 16, color: Theme.COLORS.DEFAULTTEXT}}>{objDetail.ProvinceName}</Text>
                            <Text style={{color: Theme.COLORS.DEFAULTTEXT}}>
                                {objDetail.Distance} KM</Text>
                        </View>
                        <Text style={{color: Theme.COLORS.DEFAULTTEXT, fontSize: 13, paddingRight: 5}}>{objDetail.CustomerAddress}</Text>
                    </View>
                </View>
            </View>
            <View style={{backgroundColor: "#E4E4E4", margin: 5, borderRadius: 7, padding: 10}}>
                <Text style={{color: Theme.COLORS.DEFAULTTEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 7}}>{objDetail.ItemName}</Text>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={13}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Model {objDetail.ItemCode}</Text></View>
                    <View flex={2} style={{alignItems: 'flex-end'}}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>X{objDetail.QuantityReceived}</Text></View>
                </View>
                <View flexDirection="row" style={{marginBottom: 5}}>
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: Theme.COLORS.DEFAULTTEXT}}>Phiếu bảo hành {objDetail.WarrantyNumber}</Text></View>
                </View>
                <View flexDirection="row">
                    <View flex={1}><FontAwesome name="gears" size={14} color="black" /></View>
                    <View flex={15}><Text style={{color: "red"}}>{objDetail.Symptom}</Text></View>
                </View>
            </View>
            <View style={{backgroundColor: "#E4E4E4", margin: 5, borderRadius: 7, padding: 10}}>
                <Text style={{color: Theme.COLORS.DEFAULTTEXT, fontSize: 16, fontWeight: 'bold', marginBottom: 7}}>Ghi chú</Text>
                <TextInput 
                    placeholder="Nhập ghi chú..." 
                    value={objReceiveProcess.note} 
                    onChangeText={(value) => { setObjReceiveProcess({ ...objReceiveProcess, note: value }) }}
                    style={{ borderBottomWidth: 1, marginTop: 3 }} 
                ></TextInput>
            </View>
            {role == "ktvSH"
                ?   <Button style={{backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10}} onPress={() => { confirmAlert() }}>
                        <Text style={{color: "white", fontWeight: "bold"}}>TIẾP NHẬN</Text>
                    </Button>
                :   <View>
                        { role == "ktvwdm"
                            ?   <Button style={{backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10}} onPress={() => { confirmAlertStation() }}>
                                    <Text style={{color: "white", fontWeight: "bold"}}>TIẾP NHẬN</Text>
                                </Button>
                            :   <View style = {{flexDirection:'row'}}>
                                    <Button style={{flex: 1, backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10}} onPress={() => { setModalVisible(true); getListKTV() }}>
                                        <Text style={{color: "white", fontWeight: "bold"}}>GIAO VIỆC</Text>
                                    </Button>
                                    <Button style={{flex: 1, backgroundColor: Theme.COLORS.GREEN_PORTAL, marginLeft: 5, marginRight: 5, marginTop: 10}} onPress={() => { confirmProcessing () }}>
                                        <Text style={{color: "white", fontWeight: "bold"}}>XỬ LÝ</Text>
                                    </Button>
                                </View>
                        }
                    </View>
            }
            <Modal isVisible= {isModalVisible}>
                <View style={{ backgroundColor: 'white', padding: 10 }}>
                    <View style={{alignItems:'center'}}><Text style={{fontWeight: 'bold'}} >Chọn kỹ thuật viên</Text></View>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={listUserStation}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.PhoneNumber}
                    />
                    <View style={{alignItems:'flex-end', marginTop: 10}}>
                        <TouchableOpacity onPress={()=>{setModalVisible(false)}}>
                            <Text style={{backgroundColor: 'red', paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10, borderRadius: 5, color: 'white', fontWeight:'bold'}}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
export default WaitingToReceiveDetails;