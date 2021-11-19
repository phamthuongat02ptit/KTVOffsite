import { theme } from 'galio-framework';
import React, { memo, useState} from 'react';
import { TouchableOpacity, View, Text, TextInput, Button } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import SHModelPicker from "../controls/SHModelPicker";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SHButton from "./SHButton/SHButton";
import Theme from '../../constants/Theme';


const SHModelInput = (props) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
        //console.log(isModalVisible);
    };

    const feature = (featureInput) => {
        AsyncStorage.getItem(
                "userLogin"
            ).then(user => {
                if (user) user = JSON.parse(user);
                //console.log(user.UserName);
            });
        
    };
    const test = 'aaaa';



    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const strtoday = moment(today).format("DD-MM-YYYY");
    var [strManufactureDate, setstrManufactureDate] = useState(strtoday);
    var [manufactureDate, setManufactureDate] = useState(today);
    var [typeDate, setTypeDate] = useState("manufactureDate");
    var [strPurchaseDate, setstrPurchaseDate] = useState(strtoday);
    var [purchaseDate, setPurchaseDate] = useState(today);
        /**
    * Sự kiện show model chọn mgày tháng theo loại
    * @param {*} typeDate Từ ngày hay đến ngày hay...
    */
    const showDatePicker = (typeDate) => {
        setDatePickerVisibility(true);
        setTypeDate(typeDate);
    };

  /**
   * xử lý sự kiện chọn ngày
   * @param {*} date
   */
  const handleConfirm = (date) => {
    hideDatePicker();
    if (typeDate == "manufactureDate") {
      setstrManufactureDate(moment(date).format("DD-MM-YYYY").toString());
      setManufactureDate(date);
    } else if (typeDate == "purchaseDate") {
      setstrPurchaseDate(moment(date).format("DD-MM-YYYY").toString());
      setPurchaseDate(date);
    } else if (typeDate == "repeatto") {
      setstrRepeatTo(moment(date).format("DD-MM-YYYY").toString());
      setRepeatTo(date);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

    return (
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
                            <Text style={{fontWeight: "bold" }}>
                                Từ ngày
                            </Text>
                        </View>
                        <SHModelPicker 
                            style={{flex: 1,marginTop: 3}}
                            strDate={strManufactureDate}
                            onPress={() => {
                                showDatePicker("manufactureDate");
                            }}
                        />
                    </View>
                    <View  style={{marginBottom: 10}}>
                        <View  style={{marginBottom: 5}}>
                            <Text style={{ fontWeight: "bold" }}>Đến ngày</Text>
                        </View>
                        <SHModelPicker
                            style={{flex: 1,marginTop: 3,borderRadius: 5,backgroundColor: "red",}}
                            strDate={strPurchaseDate}
                            onPress={() => {
                                showDatePicker("purchaseDate");
                            }}
                        />
                    </View>
                
                <View style={{flexDirection:'row-reverse', marginTop: 20 }}>
                    <View style={{marginLeft: 20}}>
                        <SHButton titles='ĐỒNG Ý' backgroundColor={Theme.COLORS.GREEN_KTV} onPress={()=>{toggleModal(); props.onPress}}/>
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
            onCancel={hideDatePicker}
            />
        </Modal>
    </View>
    )
  
};

export default memo(SHModelInput);
