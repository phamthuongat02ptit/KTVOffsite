import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation, StackActions } from "@react-navigation/native";
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


//màn hình thêm linh kiện
//Thuongpv 20210811
const AddItems = ({route}) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [listItemDetails, setListItemDetails] = useState([]); //danh sách tất cả linh kiện
    const [cacheListItemDetails, setCacheListItemDetails] = useState([]); //danh sách tất cả linh kiện
    const [valueItem, setValueItem] = useState("Tìm kiếm...");
    const [objParam, setObjParam] = useState(route.params.objParam);
    const navigation = useNavigation();
    const [objItem, setObjItem] = useState({});
    const [ListDetails, setListDetails] = useState(route.params.ListDetails);
    const [quantity, setQuantity] = useState("1"); //số lượng

    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListItemDetails();
        }
    }, []);

    //lấy danh sách tất cả linh kiện
    const getListItemDetails = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetItemParts',
                {
                    username: userName
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                        if (data != null || data != undefined) {
                            setListItemDetails(data);
                            setCacheListItemDetails(data);
                        } else{setListItemDetails([]); setCacheListItemDetails([]);}
                } else { Alert.alert('Lỗi', newres.ResponseMessenger) }
            });
        } catch (error) { Alert.alert('Lỗi', error) }
    }

    const goBackRequestDetails = () => {
        const checkItem = ListDetails.filter(item => item.ItemCode == objItem.ItemCode);
        if(checkItem.length > 0 ){
            Alert.alert('Lỗi', 'Linh kiện này đã có trong phiếu yêu cầu.');
            return false;
        }
        route.params.setObjParam({...objParam, lstDetails : [...objParam.lstDetails, {...objItem, RequestQuantity : quantity }]});
        route.params.setListDetails([...ListDetails, {...objItem, RequestQuantity : quantity }]);
        navigation.dispatch(StackActions.pop(1));
    }

    const setObjItems = (item) => {
        setObjItem({
            Id : null,
            ItemCode : item.ItemCode,
            ItemName : item.ItemName,
            ReceiveQuantity : 0,
            RequestNote : null,
            RequestQuantity : quantity,
            ResponseNote : null,
            StockQuantity : 0,
            afldat : null,
            magcode : null,
            ordernr : null,
            strafldat : null
        });
    }
    
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    //console.log(listItemDetails);
    //vẽ giao diện một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={()=>{toggleModal(); setValueItem(item.ItemName); setObjItems(item)}}>
                <View style={{margin:5, borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR, paddingBottom: 5}}>
                    <Text style={{color: 'blue'}}>{item.ItemName}</Text>
                    <Text style={{marginTop: 5}}>{item.ItemCode}</Text>
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
                <Button title="THÊM LINH KIỆN" color='white' onPress={() => {goBackRequestDetails()}}>THÊM LINH KIỆN</Button>
            </View>
            <Modal isVisible= {isModalVisible}>
                <View style={{ backgroundColor: 'white', padding: 10 }}>
                    <View style={{alignItems: 'center' }}><Text style={{fontWeight: "bold", fontSize: 20 }}>Chọn linh kiện</Text></View>                    
                    <SearchBar
                        placeholder="Tìm kiếm..."
                        onChangeText={(value) => { 
                            var lstItemDetails = cacheListItemDetails.filter( (e) =>
                            e.ItemName.toLowerCase().indexOf(value.toLowerCase()) != -1 || 
                            e.ItemCode.toLowerCase().indexOf(value.toLowerCase()) != -1
                            );
                            setListItemDetails(lstItemDetails);
                        }}
                        onClear={(e) => {
                            setListItemDetails(cacheListItemDetails);
                        }}
                        value={null}
                        lightTheme={true}
                        containerStyle={{ backgroundColor: "#fff", padding: 2 }}
                        inputStyle={{ height: 30, fontSize: 14 }}
                        inputContainerStyle={styles.inputContainerStyle}
                    />
                    <View style={{marginTop: 15, height: 300}}>
                        <FlatList
                            style={{ paddingTop: 2, paddingBottom: 2 }}
                            data={listItemDetails}
                            renderItem={RenderItem}
                            keyExtractor={(item) => item.ItemCode}
                        />
                    </View>
                    <View style={{flexDirection:'row-reverse', marginTop: 20 }}>
                        <View>
                            <Button color='red' onPress={toggleModal}> đóng </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
export default AddItems;

const styles = StyleSheet.create({
  inputContainerStyle: {height: 30, backgroundColor: "white", borderRadius: 20, borderBottomWidth: 1, borderColor: "#ededed", borderWidth: 1}
});
