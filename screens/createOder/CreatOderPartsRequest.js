import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import SHModelPicker from "../../components/controls/SHModelPicker";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Theme from '../../constants/Theme';

//màn hình tạo phiếu yêu cầu linh kiện
//Thuongpv 20210811
const CreatOderPartsRequest = (props) => {
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // biến isDatePickerVisible để bật tắt Picker lịch
    const today = new Date(new Date().setHours(0, 0, 0, 0)); // lấy ra ngày hiện tại
    const strtoday = moment(today).format("DD-MM-YYYY"); // lấy ra ngày hiện tại với định dạng năm-tháng-ngày
    var [requestDate, setRequestDate] = useState(today); // biến ngày yêu cầu
    var [strRequestDate, setstrRequestDate] = useState(strtoday); // biến ngày yêu cầu với định dạng str
    var [typeDate, setTypeDate] = useState("requestDate"); // kiểu ngày để truyền vào controls
    var [needDate, setNeedDate] = useState(today); // biến ngày cần
    var [strNeedDate, setstrNeedDate] = useState(strtoday); // biến ngày cần với định dạng str
    
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
       navigation.navigate('AddItems');
    }

    return (
        <View style={{padding: 10}}>
            <View style={{flexDirection:'row'}}>
                <View style={{marginBottom: 15, flex: 1}}>
                    <View style={{marginBottom: 5}}>
                        <Text style={{fontWeight: "bold" }}>Ngày yêu cầu</Text>
                    </View>
                    <SHModelPicker 
                        strDate={strRequestDate}
                        onPress={() => {
                            showDatePicker("requestDate");
                        }}
                    />
                </View>
                <View  style={{marginBottom: 10, flex: 1, marginLeft: 20}}>
                    <View  style={{marginBottom: 5}}>
                        <Text style={{ fontWeight: "bold" }}>Ngày cần</Text>
                    </View>
                    <SHModelPicker
                        strDate={strNeedDate}
                        onPress={() => {
                            showDatePicker("needDate");
                        }}
                    />
                </View>
            </View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
            <View style={{marginTop: 10, marginBottom: 20}}>
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
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5}}>
                <Button title="ĐỒNG Ý" color='white'>TẠO PHIẾU</Button>
            </View>
        </View>
    );
};
export default CreatOderPartsRequest;
