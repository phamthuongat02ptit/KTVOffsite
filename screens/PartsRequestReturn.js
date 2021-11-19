import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View, Text, FlatList, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { GetApis } from "../Common/CallApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Theme from '../constants/Theme';
import SHModelInput from "../components/controls/SHModelInput";

const Stack = createStackNavigator();

//Màn hình yêu cầu trả linh kiện
//Thuongpv 20210812
const PartsRequestReturnComponent = (props) => {
    const navigation = useNavigation();
    const [ListItemRequestReturn, setListItemRequestReturn] = useState([]); //biến danh sách yêu cầu trả linh kiện
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListItemRequestReturn();
        }
    }, [props, isFocused]);

    //lấy ra danh sách yêu cầu trả linh kiện
    const getListItemRequestReturn = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetListBillReturnNewItem',
                {
                    username: userName,
                },
                10000
            ).then((newres) => { 
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    let dataNew = [];
                    for(let index = 0; index < data.length; index++){
                        data[index].keyExtra = index+"";
                        dataNew.push(data[index]);
                    }  
                    if (dataNew != undefined && dataNew.length > 0) {
                        setListItemRequestReturn(dataNew);
                    } else { setListItemRequestReturn([]); }
                }else { Alert.alert('Lỗi', newres.ResponseMessenger) }
            });
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }

    //thông báo xác nhận xóa 1 phiếu yêu cầu trả linh kiện
    const confirmAlert = (requestNumber) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc xóa yêu cầu trả linh kiện này không?',
            [{
                text: 'Đồng ý',
                style: { color: Theme.COLORS.ERROR },
                onPress: () => {deletePartsRequestReturn(requestNumber)},
            },
            { text: 'Không', onPress: () => { return null; }, },
            ],
            { cancelable: false },
        );
    }

    //thực hiện xóa 1 phiếu yêu cầu linh kiện
    const deletePartsRequestReturn = async (requestNumber) => {
        try{
            if(requestNumber == null){
                Alert.alert(`Lỗi`, 'Số yêu cầu không xác định.', [{ text: "Đóng" }],);
                return false;
            }
            let userLogin = await AsyncStorage.getItem("userLogin");
            userLogin = JSON.parse(userLogin);
            let userName = userLogin.UserName;
            let res = await GetApis('KTV', 'DeleteBill', {requestNumber: requestNumber, loginUser: userName}, 10000)
            //setLoading(false)
            if (res.ResponseStatus == "OK") {
                Alert.alert("Thông báo", "Xóa thành công",[{ text: "Đóng" }],);
            } else {
                setTimeout(() => {
                    Alert.alert(`Lỗi`, res.ResponseMessenger, [{ text: "Đóng" }],);
                }, 10);
            }
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }

    //hàm chuyển sang màn hình CreatOderPartsRequestReturn
    const CreatOderPartsRequestReturnOnPress = () => {
       navigation.navigate('CreatOderPartsRequestReturn');
    }
    //hàm chuyển sang màn hình PartsRequestReturnDetails
    const PartsRequestReturnDetailsOnPress = (item) => {
       navigation.navigate('PartsRequestReturnDetails', item);
    }
    //vẽ một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => PartsRequestReturnDetailsOnPress(item)}>
                <View style={styles.itemBox}>
                    <View style={{flex: 3}}>
                        <Text style={styles.itemRequestNumber}>{item.RequestNumber}</Text>
                        <Text style={{marginTop: 5, paddingLeft: 5, color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.strRequestDate}</Text>
                    </View>
                    <View style={{flex: 5}}>
                        <Text style={{fontSize: 15, marginTop: 3, paddingLeft: 5, color: 'red'}}>Trạng thái: {item.strStatus}</Text>
                        <Text style={{marginTop: 5, paddingLeft: 5, color:'blue'}}>KTV: {item.RequestBy}</Text>
                    </View>
                    <View style={{flex: 1}}>
                            <View style={{alignItems:'flex-end'}}>
                                <TouchableOpacity onPress={()=>{confirmAlert(item.RequestNumber)}}>
                                    <MaterialIcons name="delete" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                            <View style={{alignItems:'flex-end'}}>
                                <Text style={styles.itemQuantity}>x{item.TotalRequestQuantityOfBill}</Text>
                            </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //vẽ màn hình danh sách yêu cầu trả linh kiện
    return (
        <View style={styles.container}>
            <View style={{flexDirection:'row'}}>
                <View style={{flex: 8}}>
                    <SHModelInput onPress={() => { }}/>
                </View>
                <View style={{ flex: 1, paddingTop: 5}}>
                    <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center'}}>
                        <TouchableOpacity onPress={CreatOderPartsRequestReturnOnPress}>
                            <Ionicons name="ios-add-circle-outline" size={40} color="blue" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <FlatList
                style={{ paddingTop: 2, paddingBottom: 2 }}
                data={ListItemRequestReturn}
                renderItem={RenderItem}
                keyExtractor={(item) => item.keyExtra}
            />
        </View>
    )
}

const PartsRequestReturn = (props) => {
    return (
        <Stack.Navigator initialRouteName="PartsRequestReturnComponent">
            <Stack.Screen
                name="PartsRequestReturnComponent"
                component={PartsRequestReturnComponent}
                options={{
                    title: "Yêu cầu trả linh kiện",
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
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "column" },
    itemBox: {
        flexDirection:'row', 
        marginTop: 6, 
        marginLeft: 5, 
        marginRight: 5, 
        borderBottomWidth: 1, 
        paddingBottom:10, 
        borderColor: Theme.COLORS.LINE_COLOR
    },
    itemRequestNumber: { fontSize: 16, fontWeight: 'bold', marginTop: 3, paddingLeft: 5, color:'green' },
    itemQuantity: { marginTop: 5, paddingLeft: 5, fontWeight:'bold', paddingRight: 2, fontSize: 16 }
})

export default PartsRequestReturn;