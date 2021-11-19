import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import Theme from '../constants/Theme';
import moment from "moment";
import { GetApis } from "../Common/CallApi";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from 'react-native-modal';
import SHModelPicker from "../components/controls/SHModelPicker";
import SHButton from "../components/controls/SHButton/SHButton";

const Stack = createStackNavigator();

//Màn hình yêu cầu trả xác
//Thuongpv 20210810
const RequestReturnComponent = (props) => {    
    const navigation = useNavigation(); //navigation để chuyển các màn hình     
    const [listRequestReturn, setlistRequestReturn] = useState([]); //listRequestReturn biến danh sách yêu cầu trả xác    
    const [isModalVisible, setModalVisible] = useState(false); // biến isModalVisible để ẩn hiện popup    
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // biến isDatePickerVisible để bật tắt Picker lịch    
    const firstDay  = new Date(new Date().setDate(1)); // lấy ra ngày mùng 1 đầu tháng hiện tại    
    const strFirstDay = moment(firstDay).format("YYYY-MM-DD"); // lấy ra ngày mùng 1 đầu tháng với định dạng năm-tháng-ngày    
    const today = new Date(new Date().setHours(0, 0, 0, 0)); // lấy ra ngày hiện tại    
    const strToday = moment(today).format("YYYY-MM-DD"); // lấy ra ngày hiện tại với định dạng năm-tháng-ngày     
    var [fromDate, setFromDate] = useState(firstDay); // biến từ ngày    
    var [strFromDate, setStrFromDate] = useState(strFirstDay); // biến từ ngày với định dạng năm-tháng-ngày    
    var [typeDate, setTypeDate] = useState("fromDate"); // kiểu ngày để truyền vào controls    
    var [toDate, setToDate] = useState(today); // biến đến ngày    
    var [strToDate, setStrToDate] = useState(strToday); // biến đến ngày với định dạng năm-tháng-ngày    
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListRequestReturn();
        }
    }, [props, isFocused]);

    //Hàm chuyển sang màn hình CreatOderRequestReturn
    const CreatOderRequestReturnOnPress = () => {
       navigation.navigate('CreatOderRequestReturn');
    }
    //Hàm chuyển sang màn hình RequestReturnDetails
    const RequestReturnDetailsOnPress = (item) => {
       navigation.navigate('RequestReturnDetails', item);
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

    //lấy ra danh sách phiếu trả xác từ ngày dến ngày
    const getListRequestReturn = async (fromDateInput, toDateInput) => {
        try {
            if(!fromDateInput || !toDateInput){
                setlistRequestReturn([])
            }
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetAllNumberReturn', {fromDate: fromDateInput, toDate: toDateInput, loginUser: userName} 
                , 10000).then((newres) => {
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            setlistRequestReturn(data);
                        } else { setlistRequestReturn([]); }
                    } else { Alert.alert('Lỗi', newres.ResponseMessenger) }
            });
        } catch (error) { Alert.alert('Lỗi', error) }
    }

    //thông báo xác nhận xóa 1 phiếu yêu cầu trả xác
    const confirmAlert = (RMANumber) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc xóa phiếu yêu cầu trả xác này không?',
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {deleteRequestReturn(RMANumber)}, },
            { text: 'Không', onPress: () => { return null }}],
            { cancelable: false },
        );
    }

    //thực hiện xóa 1 phiếu yêu cầu trả xác
    const deleteRequestReturn = async (RMANumber) => {
        try{
            if(RMANumber == null){
                Alert.alert(`Lỗi`, 'Số yêu cầu trả xác không xác định.', [{ text: "Đóng" }],);
                return false;
            }
            let userLogin = await AsyncStorage.getItem("userLogin");
            userLogin = JSON.parse(userLogin);
            let userName = userLogin.UserName;
            let obj = {
                RMANumber: RMANumber,
                loginUser: userName
            }
            let res = await GetApis('KTV', 'DeleteAllItemCodeRMA', {RMANumber: RMANumber, loginUser: userName}, 10000)
            //setLoading(false)
            if (res.ResponseStatus == "OK") {
                Alert.alert("Thông báo", "Xóa thành công",[{ text: "Đóng" }],);
            } else {
                setTimeout(() => { Alert.alert(`Lỗi`, res.ResponseMessenger, [{ text: "Đóng" }],) }, 10);
            }
        } catch (error) { Alert.alert('Lỗi', error) }
    }
    //Vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => RequestReturnDetailsOnPress(item)}>
                <View style={{marginTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, marginLeft: 5, marginRight: 5}}>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <View style={{flex: 3}}>
                            <Text style={{fontWeight: 'bold', color: 'green'}}>{item.RequestNumber}</Text>
                        </View>
                        <View  style={{flex: 10, paddingLeft: 30, paddingRight: 10}}>
                            <Text style={{color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.strtypeOrdRMA}</Text>
                        </View>
                        <View  style={{flex: 1}}>
                            <TouchableOpacity onPress={()=>{confirmAlert(item.RequestNumber)}}>
                                <MaterialIcons name="delete" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <View style={{flex: 3}}>
                            <Text style={{ color: 'red'}}>{item.strStatus}</Text>
                        </View>
                        <View  style={{flex: 10, paddingLeft: 30, paddingRight: 10}}>
                            <Text style={{color: 'blue'}}>{item.strRequestDate} {item.strApprovalDate}</Text>
                        </View>
                        <View  style={{flex: 1, alignItems: 'flex-end', paddingRight: 5}}>
                            <Text style={{fontWeight: 'bold'}}>x{item.TotalReturn}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //Vẽ màn hình yêu cầu trả xác
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
                                        <SHButton titles='ĐỒNG Ý' backgroundColor={Theme.COLORS.GREEN_KTV} onPress={()=>{toggleModal(); getListRequestReturn(strFromDate, strToDate)}}/>
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
                        <TouchableOpacity onPress={CreatOderRequestReturnOnPress}>
                            <Ionicons name="ios-add-circle-outline" size={40} color="blue" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <FlatList
            style={{ paddingTop: 2, paddingBottom: 2 }}
            data={listRequestReturn}
            renderItem={RenderItem}
            keyExtractor={(item) => item.RequestNumber}
            />
        </View>
    )
}

const RequestReturn = (props) => {
    return (
        <Stack.Navigator initialRouteName="RequestReturnComponent">
            <Stack.Screen
                name="RequestReturnComponent"
                component={RequestReturnComponent}
                options={{
                    title: "Yêu cầu trả xác",
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
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "column" },
})

export default RequestReturn;