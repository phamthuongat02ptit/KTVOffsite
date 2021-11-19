import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { SearchBar } from "react-native-elements";
import { StyleSheet, Image, Text, TouchableOpacity, View, FlatList, Alert, TextInput, CheckBox} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, Menu, Divider, Provider } from "react-native-paper";
import SHModelPicker from "../../components/controls/SHModelPicker";
import TabBar from "react-native-underline-tabbar";
import moment from "moment";
import { GetApis, PostApis } from "../../Common/CallApi";
import Theme from '../../constants/Theme';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import SHRNPicker from "../../components/controls/SHRNPicker";
var ScrollableTabView = require('react-native-scrollable-tab-view');

const CreatOderRequestReturn = (props) => {
    const [ListDetails, setListDetails] = useState([]); //danh sách linh kiện cần trả xác hoặc không cần trả xác ALL
    const [ListDetailsItem, setListDetailsItem] = useState([]); //danh sách linh kiện cần trả xác hoặc không cần trả xác thiết bị
    const [cacheListDetailsItem, setcacheListDetailsItem] = useState([]); //danh sách linh kiện cần trả xác hoặc không cần trả xác thiết bị để tìm kiếm
    const [ListDetailsAdd, setListDetailsAdd] = useState([]); //danh sách linh kiện đã chọn
    const [isRequestReturn, setIsRequestReturn] = useState(1); // biến kiểu trả xác hay không trả xác all
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
                            setListDetailsItem(data);
                            setcacheListDetailsItem(data);
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
        var res = await PostApis('KPI', `SaveNumberReturn?loginUser=${userLogin.UserName}`, ListDetailsAdd, 3000);
        if (res.ResponseStatus == "OK") {
            if (res.ResponseData != null) {
                Alert.alert(`Thông báo`, 'Tạo phiếu thành công', [{ text: "Đóng" }],);
            }
        } else {
            Alert.alert(`Lỗi`, 'Tạo phiếu thất bại', [{ text: "Đóng" }],);
        }
    }
    //danh sach loại linh kiện
    const listItemType = [
        { id: 1, name: "Linh kiện cần trả xác", },
        { id: 2, name: "Linh kiện không cần trả xác", },
    ];
    //màn hình danh sách
    const SearchOderRequestReturnDetails = () => {
        const eventAdd = (item) => {
            setListDetailsItem(ListDetailsItem.filter((e) => {return e.Id !== item.Id}));
            setcacheListDetailsItem(ListDetailsItem);
            ListDetailsAdd.push(item);
        }
        //vẽ giao diện một item
        const RenderItem = ({ item }) => {
            return (
                <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 10}}>
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
            <View style={{flex: 1, flexDirection: 'column', padding: 10}}>
                <Text style={{fontSize: 15}}>Loại linh kiện</Text>
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
                            setListDetailsAdd([]);
                        }}
                    />
                </View>
                <Text style={{fontSize: 15, marginTop: 10}}>Tìm kiếm</Text>
                <View style={{ marginTop: 10}}>
                    {/* <TextInput
                    style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                    placeholder="Tìm kiếm ..."
                    /> */}
                    <SearchBar
                        placeholder="Tìm kiếm..."
                        onChangeText={(value) => {
                            var lstItem = ListDetailsItem.filter(e =>
                                e.ItemName.toLowerCase().indexOf(value.toLowerCase()) != -1);
                            //console.log(1);
                            setcacheListDetailsItem(lstItem);
                        }}
                        onClear={(e) => {
                            setListDetailsItem(cacheListDetailsItem);
                        }}
                        value={null}
                        lightTheme={true}
                        containerStyle={{ backgroundColor: '#fff', padding: 2 }}
                        inputStyle={{ height: 30, fontSize: 14 }}
                        inputContainerStyle={{ height: 30, backgroundColor: 'white', borderRadius: 20, borderBottomWidth: 1, borderColor: '#ededed', borderWidth: 1 }}
                    />
                </View>
                <View style={{flex: 1}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListDetailsItem}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.Id}
                    />
                </View>
            </View>
        );
    }
    //màn hình đã chọn
    const CreatOderRequestReturnDetails = () => {
        const eventDelete = (item) => {
            setListDetailsAdd(ListDetailsAdd.filter((e) => {return e.Id !== item.Id}));
            ListDetailsItem.push(item);
        }
        //vẽ giao diện một item
        const RenderItemAdd = ({ item }) => {
            return (
                <View style={{borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 10}}>
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
        //vẽ màn hình danh sách đã chọn linh kiện cần trả xác và không cần trả xác
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <View style={{padding: 10}}>
                    <Text style={{fontSize: 17, marginTop: 10}}>Tìm kiếm</Text>
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
                        keyExtractor={(item) => item.Id}
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
                <SearchOderRequestReturnDetails tabLabel={{ label: "DANH SÁCH" }} />
                <CreatOderRequestReturnDetails tabLabel={{ label: "ĐÃ CHỌN" }} />
            </ScrollableTabView>
        </View>
    );
};
export default CreatOderRequestReturn;
