import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { SearchBar } from "react-native-elements";
import { StyleSheet, Image, Text, TouchableOpacity, View, FlatList, Alert, TextInput, CheckBox, VirtualizedList} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Menu, Divider, Provider } from "react-native-paper";
import TabBar from "react-native-underline-tabbar";
import moment from "moment";
import Theme from '../../constants/Theme';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SHRNPicker from "../../components/controls/SHRNPicker";
import { GetApis, PostApis } from "../../Common/CallApi";
import Modal from 'react-native-modal';
var ScrollableTabView = require('react-native-scrollable-tab-view');

//màn hình tạo phiếu yêu cầu trả linh kiện (gộp 2 màn hình danh sách và đã chọn)
//Thuongpv 20210819
const CreatOderPartsRequestReturn = (props) => {
    const [ListDetails, setListDetails] = useState([]); //danh sách linh kiện mới cần trả all
    const [ListDetailsItem, setListDetailsItem] = useState([]); //danh sách linh kiện mới cần trả chưa chọn
    const [ListDetailsAdd, setListDetailsAdd] = useState([]); //danh sách linh kiện mới cần trả đã chọn
    const [dataItem, setDataItem] = useState({}); //linh kiện khi chọn
    const [newItem, setNewItem] = useState({}); // linh kiện sau khi chọn xong
    const [isPopup, setIsPopup] = useState(false);
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListDetails();
        }
    }, [props, isFocused]);
    //lấy danh sách linh kiện mới cần trả all
    const getListDetails = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetListReturnNewItem',
                {
                    username: userName,
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                        if (data != null || data != undefined) {
                            setListDetails(data);
                            setListDetailsItem(data);
                        } else{setListDetails([]);}
                }
            });

        } catch (error) { }
    }
    //thông báo xác nhận
    const confirmAlert = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc tạo phiếu không?',
            [{
                text: 'Đồng ý',
                style: { color: Theme.COLORS.ERROR },
                onPress: () => {creatOderPost()},
            },
            {
                text: 'Không',
                onPress: () => {
                    return null;
                },
            },
            ],
            { cancelable: false },
        );
    }
    //thực hiện tạo phiếu yêu cầu
    const creatOderPost = async () => {
        let userLogin = await AsyncStorage.getItem("userLogin");
        userLogin = JSON.parse(userLogin);
        var res = await PostApis('KPI', `saveWarrantyPathTrans?loginUser=${userLogin.UserName}`, ListDetailsAdd, 3000);
        if (res.ResponseStatus == "OK") {
            if (res.ResponseData != null) {
                Alert.alert(`Thông báo`, 'Tạo phiếu thành công', [{ text: "Đóng" }],);
            }
        } else {
            Alert.alert(`Lỗi`, 'Tạo phiếu thất bại', [{ text: "Đóng" }],);
        }
    }
    //màn hình danh sách
    const SearchOderPartsRequestReturnDetails = (props) => {
        const [numberItem, setNumberItem] = useState("1"); //số lượng linh kiện đẩy vào danh sách tạo phiếu của một item
        //thêm item vào danh mục đã chọn
        const eventAdd = (item) => {
            if(item.totalReceiveQuantity == 1){
                setListDetailsItem(ListDetailsItem.filter((e) => {return e.ItemCode !== item.ItemCode}));
                //trong trường hợp danh sách đã chọn đã có item này rồi thì chỉ cần cộng thêm số lượng
                if(ListDetailsAdd.length > 0){
                    let isNewItemss = true;
                    ListDetailsAdd.forEach(element => {
                        if(element.ItemCode == item.ItemCode){ element.totalReceiveQuantity = parseInt(element.totalReceiveQuantity) + 1; isNewItemss = false ; return true }
                    });
                    if(isNewItemss){ListDetailsAdd.push(item)}
                } else {
                    ListDetailsAdd.push(item);
                }
            } else {
                setIsPopup(true);
                setDataItem(item);
            }
        }
        //sự kiện chọn linh kiện
        const eventChoseItem = () => {
            setIsPopup(false);
            //kiểm tra xem số lượng nhập vào có bằng số lượng yêu cầu không, nếu bằng thì chuyển toàn bộ sang màn hình đã chọn
            if(numberItem == dataItem.totalReceiveQuantity){
                setListDetailsItem(ListDetailsItem.filter((e) => {return e.ItemCode !== dataItem.ItemCode}));
                if(ListDetailsAdd.length > 0){
                    let isNewItems = true;
                    ListDetailsAdd.forEach(element => {
                        if(element.ItemCode == dataItem.ItemCode){ element.totalReceiveQuantity = parseInt(element.totalReceiveQuantity) + parseInt(numberItem); isNewItems = false ; return true }
                    });
                    if(isNewItems){ListDetailsAdd.push(dataItem)}
                } else {
                    ListDetailsAdd.push(dataItem);
                }
                
            } else if(numberItem < dataItem.totalReceiveQuantity){
                ListDetailsItem.forEach(element => {
                    if(element.ItemCode == dataItem.ItemCode){ element.totalReceiveQuantity = dataItem.totalReceiveQuantity - numberItem ; return true }
                });
                if(ListDetailsAdd.length > 0){
                    //nếu không phải là item mới trong danh sách đã chọn thì là false
                    let isNewItem = true;
                    ListDetailsAdd.forEach(element => {
                        if(element.ItemCode == dataItem.ItemCode){ element.totalReceiveQuantity = parseInt(element.totalReceiveQuantity) + parseInt(numberItem); isNewItem = false ; return true }
                    });
                    if(isNewItem){ListDetailsAdd.push({...dataItem, totalReceiveQuantity: numberItem});}
                } else {
                    ListDetailsAdd.push({...dataItem, totalReceiveQuantity: numberItem});
                }
            } else { Alert.alert( 'Số lượng không xác định' ) }
        }

        //vẽ giao diện một item
        const RenderItem = ({ item }) => {
            return (
                <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 10, paddingLeft: 10}}>
                    <View style={{flexDirection:'row', marginTop: 10}}>
                        <View style={{flex: 8}}>
                            <Text style={{fontWeight:'bold', color:'red'}}>{item.ItemName}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={()=>{eventAdd(item)}}>
                                <Ionicons name="ios-add-circle-outline" size={23} color="blue" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 5}}>
                        <View style={{flex: 6}}>
                            <Text style={{fontWeight:'bold', color:'green'}}>{item.ItemCode}</Text>
                        </View>
                        <View style={{flex: 1, alignItems:'center', paddingRight: 4}}>
                            <Text style={{fontWeight:'bold'}}>x{item.totalReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
            );
        };

        //vẽ màn hình danh sách linh kiện mới cần trả
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <View style={{padding: 10}}>
                    <Text style={{fontSize: 15, marginTop: 10}}>Tìm kiếm</Text>
                    <View style={{ marginTop: 10}}>
                        <TextInput
                        style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                        placeholder="Tìm kiếm ..."
                        />
                    </View>
                </View>
                <Modal isVisible= {isPopup}>
                    <View style={{ backgroundColor: 'white', padding: 10 }}>
                        <View style={{alignItems: 'flex-end'}}><TouchableOpacity onPress={()=>{setIsPopup(false)}}><Ionicons name="close-circle-outline" size={24} color="black" /></TouchableOpacity></View>
                        <View style={{alignItems:'center', marginBottom: 5}}><Text style={{fontSize: 16, fontWeight:'bold'}}>Linh kiện {dataItem.ItemName}</Text></View>
                        <Text>Số lượng</Text>
                        <TextInput
                            style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 17}}
                            keyboardType="numeric"
                            onChangeText={text => setNumberItem(text)}
                            value={numberItem}>
                        </TextInput>
                        <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5, marginTop: 10}}>
                            <Button color='white' onPress={()=>{eventChoseItem()}}>CHỌN LINH KIỆN</Button>
                        </View>
                    </View>
                </Modal>
                <View style={{flex: 1}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListDetailsItem}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.ItemCode}
                    />
                </View>
            </View>
        );
    }
    //màn hình đã chọn
    const CreatOderPartsRequestReturnDetails = () => {
        //xóa một item ra khỏi danh sách đã chọn
        const eventDelete = (item) => {
            setListDetailsAdd(ListDetailsAdd.filter((e) => {return e.ItemCode !== item.ItemCode}));
            //trường hợp nếu bên danh sách có linh kiện cần xóa thì cộng thêm số lượng vào danh sách đó
            if(ListDetailsItem.length > 0){
                let isItems = true;
                ListDetailsItem.forEach(element => {
                        if(element.ItemCode == item.ItemCode){ element.totalReceiveQuantity = parseInt(element.totalReceiveQuantity) + parseInt(item.totalReceiveQuantity); isItems = false ; return true }
                });
                if(isItems){ListDetailsItem.push(item);}
            } else{
                ListDetailsItem.push(item);
            }
        }
        //vẽ giao diện một item
        const RenderItemAdd = ({ item }) => {
            return (
                <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 10, paddingLeft: 10}}>
                    <View style={{flexDirection:'row', marginTop: 10}}>
                        <View style={{flex: 8}}>
                            <Text style={{fontWeight:'bold', color:'red'}}>{item.ItemName}</Text>
                        </View>
                        <View style={{flex: 1}}>
                            <TouchableOpacity onPress={()=>{eventDelete(item)}}>
                                <MaterialIcons name="delete" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 5}}>
                        <View style={{flex: 6}}>
                            <Text style={{fontWeight:'bold', color:'green'}}>{item.ItemCode}</Text>
                        </View>
                        <View style={{flex: 1, alignItems:'center', paddingRight: 4}}>
                            <Text style={{fontWeight:'bold'}}>x{item.totalReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
            );
        };
        //vẽ màn hình danh sách đã chọn linh kiện mới cần trả
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <View style={{padding: 10}}>
                    <Text style={{fontSize: 15, marginTop: 10}}>Tìm kiếm</Text>
                    <View style={{ marginTop: 10}}>
                        <TextInput
                        style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                        placeholder="Tìm kiếm ..."
                        />
                    </View>
                </View>
                <View style={{flex: 1, padding: 10}}>
                     <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListDetailsAdd}
                        renderItem={RenderItemAdd}
                        keyExtractor={(item) => item.ItemCode}
                    />
                </View>
                <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5, margin: 10}}>
                    <Button color='white' onPress={()=>{confirmAlert()}}>TẠO PHIẾU</Button>
                </View>
            </View>
        );
    }

    return (
        <View style={{flex: 1, backgroundColor: 'white'}}>
            <ScrollableTabView
                tabBarActiveTextColor= {Theme.COLORS.GREEN_KTV}
                tabBarInactiveTextColor= {Theme.COLORS.Text_COLOR_GRAY}
                renderTabBar={() =>
                <TabBar
                    underlineColor={Theme.COLORS.GREEN_KTV}
                    tabBarStyle={{ marginTop: 0, paddingTop: 5,  }}
                />}>
                <SearchOderPartsRequestReturnDetails tabLabel={{ label: "DANH SÁCH" }} />
                <CreatOderPartsRequestReturnDetails tabLabel={{ label: "ĐÃ CHỌN" }} />
            </ScrollableTabView>
        </View>
    );
};
export default CreatOderPartsRequestReturn;
