import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import SHModelPicker from "../../components/controls/SHModelPicker";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Modal from 'react-native-modal';
import { GetApis, PostApis } from "../../Common/CallApi";
import Theme from '../../constants/Theme';

//màn hình chi tiết phiếu yêu cầu linh kiện
//Thuongpv 20210811
const PartsRequestDetails = (props) => {
    const [ListDetails, setListDetails] = useState([]); //danh sách linh kiện chi tiết
    const [objParam, setObjParam] = useState({}); //đối tượng param truyền vào api tạo phiếu
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // biến isDatePickerVisible để bật tắt Picker lịch
    let strRequestDateFM = moment(props.dataDetail.RequestDate).format("DD-MM-YYYY");
    let strNeedDateFM = moment(props.dataDetail.NeedReceiveDate).format("DD-MM-YYYY");
    var [requestDate, setRequestDate] = useState(props.dataDetail.RequestDate); // biến ngày yêu cầu
    var [strRequestDate, setstrRequestDate] = useState(strRequestDateFM); // biến ngày yêu cầu với định dạng str
    var [typeDate, setTypeDate] = useState("requestDate"); // kiểu ngày để truyền vào controls
    var [needDate, setNeedDate] = useState(props.dataDetail.NeedReceiveDate); // biến ngày cần
    var [strNeedDate, setstrNeedDate] = useState(strNeedDateFM); // biến ngày cần với định dạng str
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListDetails();
        }
    }, []);

    //lấy chi tiết phiếu yêu cầu linh kiện
    const getListDetails = async () => {
        try {
            setstrRequestDate(strRequestDateFM);
            setstrNeedDate(strNeedDateFM);
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
                
            await GetApis('KTV', 'GetWarrantyPartTransDetail',
                {
                    requestNumber: props.dataDetail.RequestNumber,
                    username: userName,
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                        if (data != undefined) {
                            setObjParam(data);
                            const listData = data.lstDetails;
                            if(listData != undefined){
                                setListDetails(listData);
                            } else{setListDetails([]);}
                        } else {setObjParam({})}
                } else { Alert.alert('Lỗi', newres.ResponseMessenger) }
            });
        } catch (error) { Alert.alert('Lỗi', error) }
    }

    
    //hàm chọn model theo loại truyền vào
    const showDatePicker = (typeDate) => {
        setDatePickerVisibility(true);
        setTypeDate(typeDate);
    };

    //hàm xử lý sự kiện chọn ngày
    const handleConfirm = (date) => {
        hideDatePicker();
        if (typeDate == "requestDate") {
            setstrRequestDate(moment(date).format("DD-MM-YYYY").toString());
            setRequestDate(date);
        } else {
            setstrNeedDate(moment(date).format("DD-MM-YYYY").toString());
            setNeedDate(date);
        }
    };

    // hàm tắt modal chọn ngày
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const navigation = useNavigation();
    // hàm chuyển sang màn hình AddItems
    const AddItems = () => {
        navigation.navigate('AddItems', {objParam, setObjParam, ListDetails, setListDetails});
    }

    //thông báo xác nhận xóa 1 một linh kiện trong phiếu yêu cầu linh kiện
    const confirmAlert = (ItemCode) => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc xóa linh kiện này không?',            
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {deletePartsRequestDetails(ItemCode)}, },
            { text: 'Không', onPress: () => { return null; }, }, ],
            { cancelable: false },
        );
    }
    //thông báo xác nhận tạo phiếu yêu cầu linh kiện
    const confirmAlertCreateOder = (ItemCode) => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc tạo phiếu này không?',            
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {createOder()}, },
            { text: 'Không', onPress: () => { return null; }, }, ],
            { cancelable: false },
        );
    }
    //thực hiện tạo phiếu yêu cầu linh kiện
     const createOder =async () => {
        let userLogin = await AsyncStorage.getItem("userLogin");
        userLogin = JSON.parse(userLogin);
         Alert.alert(`Thông báo`, 'Tạo phiếu thành công', [{ text: "Đóng" }],);
        // var res = await PostApis('KPI', `SaveWarrantyPartRequest?loginUser=${userLogin.UserName}`, objParam, 3000);
        // if (res.ResponseStatus == "OK") {
        //     if (res.ResponseData != null) {
        //         Alert.alert(`Thông báo`, 'Tạo phiếu thành công', [{ text: "Đóng" }],);
        //     }
        // } else {
        //     Alert.alert(`Lỗi`, 'Tạo phiếu thất bại', [{ text: "Đóng" }],);
        // }
    }

    //thực hiện xóa 1 linh kiện trong phiếu yêu cầu linh kiện
    const deletePartsRequestDetails = async (ItemCode) => {
        if(props.dataDetail.RequestNumber == null){
            Alert.alert(`Lỗi`, 'Số yêu cầu linh kiện không xác định.', [{ text: "Đóng" }],);
            return false;
        }
        if(ItemCode == null){
            Alert.alert(`Lỗi`, 'Mã linh kiện không xác định.', [{ text: "Đóng" }],);
            return false;
        }
        let userLogin = await AsyncStorage.getItem("userLogin");
        userLogin = JSON.parse(userLogin);
        try{
            let userName = userLogin.UserName;
            let obj = {
                ItemCode: ItemCode,
                requestNumber: props.dataDetail.RequestNumber,
                loginUser: userName
            }
            let res = await GetApis('KTV', 'deleteItem', {ItemCode: ItemCode, requestNumber: props.dataDetail.RequestNumber, loginUser: userName}, 10000)
            if (res.ResponseStatus == "OK") {
                Alert.alert("Thông báo", "Xóa thành công",[{ text: "Đóng" }],);
            } else {
                setTimeout(() => {
                    Alert.alert(`Lỗi`, res.ResponseMessenger, [{ text: "Đóng" }],);
                }, 10);
            }
        }
        catch (error) {
            Alert.alert(`Lỗi`, error);
        }
    }

    //vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity>
                <View style={{borderBottomWidth: 1, paddingBottom: 10, borderColor: Theme.COLORS.LINE_COLOR}}>
                    <View style={{flexDirection:'row', marginTop: 11}}>
                        <View flex={8}>
                            <Text style={{fontWeight:'bold', color:'blue'}}>{item.ItemName}</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <TouchableOpacity onPress={()=>{confirmAlert(item.ItemCode)}}>
                                <MaterialIcons name="delete" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 5}}>
                        <View flex={8}>
                            <Text style={{fontWeight: 'bold', color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.ItemCode}</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <Text style={{fontWeight: 'bold'}}>X{item.RequestQuantity}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 5}}>
                        <View flex={8}>
                            <Text style={{color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>Nhận</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <Text style={{fontWeight: 'bold'}}>X{item.ReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    //vẽ màn hình chi tiết linh kiện
    return (
        <View style={{flex: 1, flexDirection: 'column', padding: 10}}>
            <View>
                <View style={[styles.backgroundColorGray, { padding: 10, borderRadius: 5}]}>
                    <Text style={styles.titleName}>Phiếu yêu cầu linh kiện</Text>
                    <View style={{flexDirection:'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text style={{fontSize: 15, color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{props.dataDetail.RequestNumber}</Text>
                        <Text style={{fontSize: 15, color: 'red', fontWeight:'bold'}}>{props.dataDetail.strRequestStatus}</Text>
                    </View>
                </View>
                <View style={{marginTop: 10, flexDirection: 'row'}}>
                    <View style={{marginBottom: 15, flex: 1}}>
                        <View style={{marginBottom: 5}}>
                            <Text style={{fontWeight: "bold" }}>Ngày yêu cầu</Text>
                        </View>
                        <SHModelPicker 
                            style={{flex: 1,marginTop: 3}}
                            strDate={strRequestDate}
                            onPress={() => {
                                //showDatePicker("requestDate");
                            }}
                        />
                    </View>
                    <View  style={{marginBottom: 10, flex: 1, marginLeft: 20}}>
                        <View  style={{marginBottom: 5}}>
                            <Text style={{ fontWeight: "bold" }}>Ngày cần</Text>
                        </View>
                        <SHModelPicker
                            style={{flex: 1,marginTop: 3,borderRadius: 5,backgroundColor: "red",}}
                            strDate={strNeedDate}
                            onPress={() => {
                                showDatePicker("needDate");
                            }}
                        />
                    </View>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                    />
                </View>
                <View>
                    <TouchableOpacity onPress={AddItems}>
                        <View style={{flexDirection:'row', backgroundColor: Theme.COLORS.BACKGROUND_COLOR_GRAY_DARK, borderRadius: 5}}>
                            <View style={{flex: 1}}>
                                <Text style={{ padding: 5, fontSize: 14, paddingTop: 5}}>LINH KIỆN YÊU CẦU</Text>
                            </View>
                            <View style={{marginRight: 10}}>
                                <Ionicons name="ios-add-circle-outline" size={30} color="blue" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{flex: 1, marginTop: 5, marginBottom: 5}}>
                <FlatList
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                    data={ListDetails}
                    renderItem={RenderItem}
                    keyExtractor={(item) => item.ItemCode}
                />
            </View>
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5}}>
                <Button color='white' onPress={() => {confirmAlertCreateOder()}}>TẠO PHIẾU</Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backgroundColorGray: {
        backgroundColor: Theme.COLORS.BACKGROUND_COLOR_GRAY_DARK,
    },
    titleName: {
        fontWeight: 'bold',
        fontSize: 19,
        color: Theme.COLORS.Text_COLOR_GRAY_DARK,
    },
})

export default PartsRequestDetails;
