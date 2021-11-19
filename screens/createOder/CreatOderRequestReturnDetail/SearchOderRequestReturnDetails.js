import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Alert, TextInput, FlatList, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { GetApis } from "../../../Common/CallApi";
import Theme from '../../../constants/Theme';
import { SearchBar } from "react-native-elements";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Menu, Divider, Provider } from "react-native-paper";
import SHModelPicker from "../../../components/controls/SHModelPicker";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SHRNPicker from "../../../components/controls/SHRNPicker";

const SearchOderRequestReturnDetails = (props) => {
    const [ListDetails, setListDetails] = useState([]); //danh sách linh kiện cần trả xác hoặc không cần trả xác
    const [isRequestReturn, setIsRequestReturn] = useState(1); // biến kiểu trả xác hay không trả xác
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListDetails();
        }
    }, [props, isFocused, isRequestReturn]);

    //lấy danh sách linh kiện cần trả xác hoặc không cần trả xác
    const getListDetails = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetAllItemReturn',
                {
                    loginUser: userName,
                    typeWarranty: isRequestReturn
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                        if (data != null || data != undefined) {
                            setListDetails(data);
                        } else{setListDetails([]);}
                }
            });
           
        } catch (error) { }
    }
    //danh sach loại linh kiện
    const listItemType = [
        {
            id: 1,
            name: "Linh kiện cần trả xác",
        },
        {
            id: 2,
            name: "Linh kiện không cần trả xác",
        },
    ];
    //vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 10}}>
                <View style={{flexDirection:'row', marginTop: 10}}>
                    <View style={{flex: 8}}>
                        <Text style={{fontWeight:'bold', color:'red'}}>{item.ItemName}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <TouchableOpacity onPress={()=>{}}>
                            <Ionicons name="ios-add-circle-outline" size={23} color="blue" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flexDirection:'row', marginTop: 5}}>
                    <View style={{flex: 6}}>
                        <Text style={{fontWeight:'bold', color:'green'}}>{item.ItemCode}</Text>
                    </View>
                    <View style={{flex: 1, alignItems:'center', paddingRight: 4}}>
                        <Text style={{fontWeight:'bold'}}>x{item.Quantity}</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row', marginTop: 5}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontWeight:'bold'}}>{item.CostCenter}</Text>
                    </View>
                    <View style={{flex: 3, alignItems:'center', paddingRight: 4}}>
                        <Text style={{color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.WarrantyNumber} - {item.strActionDate}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{padding: 10}}>
            <Text style={{fontSize: 17}}>Loại linh kiện</Text>
            <View style={{flexDirection:'row', marginTop: 10}}>
                <SHRNPicker
                    showSearchBar={true}
                    placeHolderLabel="Chọn loại linh kiện"
                    dataSource={listItemType}
                    dummyDataSource={listItemType}
                    value={listItemType[0].name}
                    defaultValue={true}
                    selectedLabel={listItemType[isRequestReturn-1].name}
                    selectedValue={(index, item) => {
                        setIsRequestReturn(item.id);
                    }}
                />
            </View>
            <Text style={{fontSize: 17, marginTop: 10}}>Tìm kiếm</Text>
            <View style={{ marginTop: 10}}>
                <TextInput
                style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                placeholder="Tìm kiếm ..."
                />
            </View>
            <View>
                <ScrollView style={{ height: 430}}>
                    <View>
                        <FlatList
                            style={{ paddingTop: 2, paddingBottom: 2 }}
                            data={ListDetails}
                            renderItem={RenderItem}
                            keyExtractor={(item) => item.Id}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
export default SearchOderRequestReturnDetails;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
});