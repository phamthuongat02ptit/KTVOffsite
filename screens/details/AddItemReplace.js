import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Alert, TextInput, FlatList, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import moment from "moment";
import Modal from 'react-native-modal';
import Theme from '../../constants/Theme';
import { ScrollView } from "react-native-gesture-handler";
import { GetApis } from "../../Common/CallApi";
import { SearchBar } from "react-native-elements";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Menu, Divider, Provider } from "react-native-paper";

const Stack = createStackNavigator();

//màn hình thêm linh kiện thay thế
//Thuongpv 20210823
const AddItemReplace = ({route}) => {
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [ListInventory, setListInventory] = useState([]); //biến danh sách linh kiện tồn kho
    const [CacheListInventory, setCacheListInventory] = useState([]); //biến danh sách linh kiện tồn kho tìm kiếm
    const [valueItem, setValueItem] = useState("Tìm kiếm...");
    const [objAddItem, setObjAddItem] = useState({}); //đối tượng lấy ra item cần thay thế
    const [quantity, setQuantity] = useState("1"); //số lượng
    const [Roles, setRoles] = useState("ktvSH"); //vai trò user

    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListInventory();
        }
    }, [route.params.item, isFocused]);
    //console.log(objAddItem.ItemCode);
    //Hàm lấy danh sách linh kiện tồn kho để chọn linh kiện thay thế
    const getListInventory = async () => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = '';
            let WDCCode = '';
            let role = "ktvSH";
            if (userLogin && JSON.parse(userLogin) != null){
                userName = JSON.parse(userLogin).UserName;
                if(JSON.parse(userLogin).WDCCode){
                    WDCCode = JSON.parse(userLogin).WDCCode;
                }
                if (JSON.parse(userLogin).Role) {
                    role = JSON.parse(userLogin).Role;
                    setRoles(JSON.parse(userLogin).Role);
                }
            }
            if(role == "ktvwdm" || role == "wdm"){
                await GetApis('KTV', 'GetListPartsByClassCode',
                    {   
                        WDCCode: WDCCode,
                        UserName: userName,
                        ItemCode: route.params.item.ItemCode
                    },
                    10000
                ).then((newres) => { 
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            setListInventory(data);
                            setCacheListInventory(data);
                        } else { setListInventory([]); setCacheListInventory([]) }
                    }
                });
            }else{
                await GetApis('KTV', 'GetWarrantyItemByUser',
                    {   
                        WOIID: route.params.item.WOIID,
                        loginUser: userName,
                    },
                    10000
                ).then((newres) => { 
                    if (newres && newres.ResponseStatus == 'OK') {
                        const data = newres.ResponseData;
                        if (data != undefined) {
                            setListInventory(data);
                            setCacheListInventory(data);
                        } else { setListInventory([]); setCacheListInventory([]) }
                    }
                });
            }
        }
        catch (error) { }
    }
    //console.log(ListInventory);
    //console.log(ListInventory);
    //hàm additem
    const additem = async() => {
        try {
            let userLogin = await AsyncStorage.getItem('userLogin');
            let userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null) userName = JSON.parse(userLogin).UserName;
            let newQuantity = parseInt(quantity);
            if(newQuantity == null || newQuantity == undefined || newQuantity == 0){ Alert.alert('Lỗi', 'Số lượng không xác định.' ); return false}
            if(objAddItem == null || objAddItem == undefined || Object.values(objAddItem).length === 0) { Alert.alert('Lỗi', 'Linh kiện không xác định.' ); return false}
            let processid = route.params.item.WOIID;
            if(processid == null || processid == undefined) { Alert.alert('Lỗi', 'Không tìm thấy ca xử lý.' ); return false}
            if(Roles == "ktvSH"){
                await GetApis('KTV', 'AddWarrantyProcessReplacePart',
                    {   
                        processid: processid,
                        itemcode: objAddItem.ItemCode,
                        quantity: newQuantity,
                        ArrTEID: "",
                        loginUser: userName,
                    },
                    10000
                ).then((newres) => {
                    if (newres && newres.ResponseStatus == 'OK') {
                        console.log("Thêm mới thành công");
                        route.params.setisChecked(route.params.isChecked);
                        navigation.navigate('ProcessDetails');
                    } else {
                        setTimeout(() => {
                            Alert.alert(`Lỗi`, newres.ResponseMessenger, [{ text: "Đóng" }],);
                        }, 10);
                    }
                });
            }else{
                await GetApis('KTV', 'AddWarrantyProcessReplacePartStation',
                    {   
                        processid: processid,
                        itemcode: objAddItem.ItemCode,
                        quantity: newQuantity,
                        ArrTEID: "",
                        loginUser: userName,
                    },
                    10000
                ).then((newres) => {
                    if (newres && newres.ResponseStatus == 'OK') {
                        console.log("Thêm mới thành công");
                        route.params.setisChecked(route.params.isChecked);
                        navigation.navigate('ProcessDetails');
                    } else {
                        setTimeout(() => {
                            Alert.alert(`Lỗi`, newres.ResponseMessenger, [{ text: "Đóng" }],);
                        }, 10);
                    }
                });
            }
            
            
        } catch (error) { Alert.alert('Lỗi', 'Không thêm được linh kiện' ) }

    }

    //thông báo xác nhận thêm linh kiện
    const confirmAlert = () => {
        Alert.alert( 'Xác nhận', 'Bạn có chắc thêm linh kiện này không?', 
            [{ text: 'Đồng ý', style: { color: Theme.COLORS.ERROR }, onPress: () => {additem()}, },
            { text: 'Không', onPress: () => { return null; }}],
            { cancelable: false },
        );
    }
    
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    //vẽ giao diện một item cho ktv sunhouse
    const RenderItemSH = ({ item }) => {
        return (
            <TouchableOpacity onPress={()=>{toggleModal(); setValueItem(item.ItemName); setObjAddItem(item)}}>
                <View style={{margin:5, borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 5}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{color: Theme.COLORS.GREEN_KTV, flex: 7, fontWeight:'bold'}}>{item.ItemName}</Text>
                        <Text style={{flex: 1}}>
                            {
                                item.WMReturnPart ? <Ionicons name="star" size={20} color="red" /> : <Text></Text>
                            }
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <Text style={{ flex: 7}}>{item.ItemCode}</Text>
                        <Text style={{ flex: 1, fontWeight: 'bold'}}>X{item.TotalReceiveQuantity}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //vẽ giao diện một item cho ktv trạm
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={()=>{toggleModal(); setValueItem(item.ItemName); setObjAddItem(item)}}>
                <View style={{margin:5, borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 5}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={{color: Theme.COLORS.GREEN_KTV, flex: 7, fontWeight:'bold'}}>{item.ItemName}</Text>
                        <Text style={{flex: 1}}>
                            {
                                item.WMReturnPart ? <Ionicons name="star" size={20} color="red" /> : <Text></Text>
                            }
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <Text style={{ flex: 7}}>{item.ItemCode}</Text>
                        <Text style={{ flex: 1, fontWeight: 'bold'}}>X{item.Quantity}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{padding: 10}}>
            <Text style={{fontSize: 17}}>Linh kiện</Text>
            <View style={{flexDirection:'row', marginTop: 10}}>
                <View style={{backgroundColor: 'white', flex: 8}}>
                    <TouchableOpacity onPress={toggleModal}>
                        <View style={{flexDirection:'row'}}>
                            <View style={{flex: 1}}>
                                <TextInput
                                    editable={false}
                                    placeholder="Tìm kiếm..."
                                    style={{ padding: 5, fontSize: 14, color: "#818181", paddingTop: 5}}
                                    value={valueItem}
                                ></TextInput>
                            </View>
                            <View style={{marginRight: 10}}>
                                <FontAwesome name="caret-down" size={30} color="#818181"/>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, paddingTop: 5}}>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                        <TouchableOpacity>
                            <FontAwesome name="refresh" size={30} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Text style={{marginTop: 10, marginBottom: 10}}>Số lượng</Text>
            <TextInput
                style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                placeholder="1"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
            />
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5, marginTop: 15}}>
                <Button color='white' onPress={confirmAlert}>THÊM LINH KIỆN</Button>
            </View>
            <Modal isVisible= {isModalVisible}>
                <View style={{ backgroundColor: 'white', padding: 10 }}>
                    <SearchBar
                        placeholder="Tìm kiếm..."
                        onChangeText={(value) => { var lstItem = CacheListInventory.filter( (e) =>
                            e.ItemName.toLowerCase().indexOf(value.toLowerCase()) != -1
                            );
                            //console.log(1);
                            setListInventory(lstItem);
                        }}
                        onClear={(e) => {
                            //  console.log(2);
                            setListInventory(CacheListInventory);
                        }}
                        value={null}
                        lightTheme={true}
                        containerStyle={{ backgroundColor: "#fff", padding: 2 }}
                        inputStyle={{ height: 30, fontSize: 14 }}
                        inputContainerStyle={{ height: 30, backgroundColor: "white", borderRadius: 20, borderBottomWidth: 1, borderColor: "#ededed", borderWidth: 1, }}
                    />
                    <View style={{marginTop: 10, height: 300}}>
                        <FlatList
                            style={{ paddingTop: 2, paddingBottom: 2 }}
                            data={ListInventory}
                            renderItem={Roles == "ktvSH" ? RenderItemSH : RenderItem}
                            keyExtractor={(item) => item.ItemCode}
                        />
                    </View>
                    <View style={{flexDirection:'row-reverse', marginTop: 20 }}>
                        <View>
                            <Button color='red' onPress={toggleModal}>đóng</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
export default AddItemReplace;
