import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import Theme from '../constants/Theme';
import moment from "moment";
import { GetApis } from "../Common/CallApi";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from 'react-native-modal';
import InfoCheckIn from "../screens/InfoCheckIn";
import SHModelPicker from "../components/controls/SHModelPicker";
import SHButton from "../components/controls/SHButton/SHButton";

const Stack = createStackNavigator();

//Màn hình chấm công
//Thuongpv 20210809
const TimekeepingComponent = (props) => {
    //navigation để chuyển các màn hình
    const navigation = useNavigation();
    //listTimekeeping biến danh sách công 
    const [listTimekeeping, setlistTimekeeping] = useState([]);
    // biến isModalVisible để ẩn hiện popup
    const [isModalVisible, setModalVisible] = useState(false);
    // biến isDatePickerVisible để bật tắt Picker lịch
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    // lấy ra ngày mùng 1 đầu tháng hiện tại
    const firstDay  = new Date(new Date().setDate(1));
    // lấy ra ngày mùng 1 đầu tháng với định dạng năm-tháng-ngày
    const strFirstDay = moment(firstDay).format("YYYY-MM-DD");
    // lấy ra ngày hiện tại
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    // lấy ra ngày hiện tại với định dạng năm-tháng-ngày 
    const strToday = moment(today).format("YYYY-MM-DD");
    // biến từ ngày
    var [fromDate, setFromDate] = useState(firstDay);
    // biến từ ngày với định dạng năm-tháng-ngày
    var [strFromDate, setStrFromDate] = useState(strFirstDay);
    // kiểu ngày để truyền vào controls
    var [typeDate, setTypeDate] = useState("fromDate");
    // biến đến ngày
    var [toDate, setToDate] = useState(today);
    // biến đến ngày với định dạng năm-tháng-ngày
    var [strToDate, setStrToDate] = useState(strToday);
    
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListTimekeeping(strFromDate, strToDate);
        }
    }, [props, isFocused]);

    //Hàm chuyển sang màn hình InfoCheckIn
    const InfoCheckInOnPress = () => {
       navigation.navigate('InfoCheckIn');
    }

    //Hàm set lại biến ẩn hiện popup
    const toggleModal = () => {
        setFromDate(firstDay);
        setStrFromDate(strFirstDay);
        setToDate(today);
        setStrToDate(strToday);
        setModalVisible(!isModalVisible);
    };

    //hàm chọn model theo loại truyền vào
    const showDatePicker = (typeDate) => {
        setDatePickerVisibility(true);
        setTypeDate(typeDate);
    };

    //hàm xử lý sự kiện chọn ngày
    const handleConfirm = (date) => {
        setDatePickerVisibility(false);
        if (typeDate == "fromDate") {
        setStrFromDate(moment(date).format("YYYY-MM-DD").toString());
        setFromDate(date);
        } else {
        setStrToDate(moment(date).format("YYYY-MM-DD").toString());
        setToDate(date);
        }
    };

    //lấy ra danh sách công từ ngày dến ngày
    const getListTimekeeping = async (fromDateInput, toDateInput) => {
        try {
            if(!fromDateInput || !toDateInput){
                setlistTimekeeping([])
            }
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetListCheckIn', {fromDate: fromDateInput, toDate: toDateInput, loginUser: userName} 
                , 10000).then((newres) => {
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            setlistTimekeeping(data);
                        } else { setlistTimekeeping([]); }
                    }
            });
        }
        catch (error) {
            Alert.alert('Lỗi', error);
        }
    }

    //Vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity>
                <View style={{marginTop: 5, padding: 5}}>
                    <Text style={{backgroundColor:'#009387', color:'white', paddingTop: 3, paddingBottom: 3, paddingLeft: 5, fontWeight: 'bold'}}>{item.strCheckDay}</Text>
                    <View style={{flexDirection:'row', marginTop: 3}}>
                        <View flex={1}>
                            <Text style={{color: 'blue', fontWeight: 'bold'}}>{item.UserName}</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <Text style={{color: 'red'}}>{item.strStatus}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 3}}>
                        <View style={{flex: 1}}>
                            <FontAwesome5 name="clock" size={17} color="black" />
                        </View>
                        <View style={{flex: 12}}>
                            <Text style={{fontWeight: 'bold'}}>Thời gian: {item.strCheckDate}</Text>
                        </View>
                        <View style={{flex: 5, alignItems: 'flex-end'}}>
                            <Text>{item.Distance} KM</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 3}}>
                        <View style={{flex: 1}}>
                            <Ionicons name="settings-sharp" size={17} color="black" />
                        </View>
                        <View style={{flex: 17}}>
                            <Text>Phiếu xử lý: {item.WarrantyNumber}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //Vẽ màn hình chấm công
    return (
        <View style={styles.container}>
            <View style={{flexDirection:'row'}}>
                <View style={{flex: 8}}>
                    <View style={{flexDirection: 'row', marginTop: 5, marginLeft: 5, marginRight: 5}}>
                        <View style={{flex: 8, borderWidth: 1, borderRadius: 15, borderColor: "#818181"}}>
                            <TouchableOpacity onPress={toggleModal}>
                                <View style={{flexDirection:'row'}}>
                                    <View style={{flex: 1}}>
                                        <TextInput
                                            placeholder="Tìm kiếm..."
                                            style={{ padding: 5, fontSize: 14, color: "#818181", paddingTop: 5}}
                                        ></TextInput>
                                    </View>
                                    <View style={{marginRight: 10}}>
                                        <FontAwesome name="caret-down" size={36} color="#818181"/>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Modal isVisible= {isModalVisible}>
                            <View style={{ backgroundColor: 'white', padding: 10 }}>
                                <View style={{alignItems: 'center', marginBottom: 20 }}><Text style={{fontWeight: "bold" }}>Tìm kiếm</Text></View>
                                <View style={{marginBottom: 15}}>
                                    <View style={{marginBottom: 5}}>
                                        <Text style={{fontWeight: "bold" }}>Từ ngày</Text>
                                    </View>
                                    <SHModelPicker 
                                        style={{flex: 1,marginTop: 3}}
                                        strDate={strFromDate}
                                        onPress={() => {
                                            showDatePicker("fromDate");
                                        }}
                                    />
                                </View>
                                <View  style={{marginBottom: 10}}>
                                    <View  style={{marginBottom: 5}}>
                                        <Text style={{ fontWeight: "bold" }}>Đến ngày</Text>
                                    </View>
                                    <SHModelPicker
                                        style={{flex: 1,marginTop: 3,borderRadius: 5,backgroundColor: "red",}}
                                        strDate={strToDate}
                                        onPress={() => {
                                            showDatePicker("toDate");
                                        }}
                                    />
                                </View>
                                <View style={{flexDirection:'row-reverse', marginTop: 20 }}>
                                    <View style={{marginLeft: 20}}>
                                        <SHButton titles='ĐỒNG Ý' backgroundColor={Theme.COLORS.GREEN_KTV} onPress={()=>{toggleModal(); getListTimekeeping(strFromDate, strToDate)}}/>
                                    </View>
                                    <View>
                                        <SHButton titles='ĐÓNG' backgroundColor={Theme.COLORS.INFO} onPress={toggleModal}/>
                                    </View>
                                </View>
                            </View>
                            <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={() => setDatePickerVisibility(false)}
                            />
                        </Modal>
                    </View>
                </View>
                <View style={{ flex: 1, paddingTop: 5}}>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                        <TouchableOpacity onPress={InfoCheckInOnPress}>
                            <Ionicons name="ios-add-circle-outline" size={40} color="blue" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <FlatList
            style={{ paddingTop: 2, paddingBottom: 2 }}
            data={listTimekeeping}
            renderItem={RenderItem}
            keyExtractor={(item) => item.strCheckDate}
            />
        </View>
    )
}

const Timekeeping = (props) => {
    return (
        <Stack.Navigator initialRouteName="TimekeepingComponent">
            <Stack.Screen
                name="TimekeepingComponent"
                component={TimekeepingComponent}
                options={{
                    title: "Chấm công",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTab")} >
                            <Ionicons name="ios-menu" size={30} color="white" onPress={() => props.navigation.openDrawer()} />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
            <Stack.Screen name="InfoCheckIn"
                component={InfoCheckInScreen}
                options={{
                    title: "Thông tin",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("TimekeepingComponent")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
        </Stack.Navigator>
    );
}

//man hinh thông tin checkin
function InfoCheckInScreen(props) { 
    return (
        <InfoCheckIn dataDetail={props.route.params} />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },

})

export default Timekeeping;