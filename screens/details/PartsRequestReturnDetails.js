import React, { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, TextInput, Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { GetApis } from "../../Common/CallApi";
import Theme from '../../constants/Theme';

//Màn hình chi tiết phiếu trả linh kiện
//Thuongpv 20210812
const PartsRequestReturnDetails = (props) => {
    const [ListDetails, setListDetails] = useState([]); //biến danh sách linh kiện chi tiết trong phiếu yêu cầu trả linh kiện
    const isFocused = useIsFocused();

     useEffect(() => {
        if (isFocused) {
            getListDetails();
        }
    }, [props, isFocused]);

    //lấy chi tiết phiếu yêu cầu trả linh kiện
    const getListDetails = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetDetailForBill',
                {
                    requestNumber: props.dataDetail.RequestNumber,
                    loginUser: userName,
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
                        setListDetails(dataNew);
                    } else { setListDetails([]); }
                } else { Alert.alert('Lỗi', newres.ResponseMessenger) }
            });
        } catch (error) { Alert.alert('Lỗi', error) }
    }

    //thông báo xác nhận xóa 1 một linh kiện trong phiếu yêu cầu trả linh kiện
    const confirmAlert = (item) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc xóa linh kiện này không?',
            [{
                text: 'Đồng ý',
                style: { color: Theme.COLORS.ERROR },
                onPress: () => {deletePartsRequestReturnDetails(item)},
            },
            { text: 'Không', onPress: () => { return null }, },
            ],
            { cancelable: false },
        );
    }

    //thực hiện xóa 1 linh kiện trong phiếu yêu cầu trả linh kiện
    const deletePartsRequestReturnDetails = async (item) => {
        try{
            // if(Id == null){
            //     Alert.alert(`Lỗi`, 'Id linh kiện xác không xác định.', [{ text: "Đóng" }],);
            //     return false;
            // }
            // let userLogin = await AsyncStorage.getItem("userLogin");
            // userLogin = JSON.parse(userLogin);
            // let userName = userLogin.UserName;
            // let obj = {
            //     Id: Id,
            //     loginUser: userName
            // }
            // let res = await GetApis('KTV', `RemoveItemCodeOfRequestReturnDeath/${Id}`, {loginUser: userName}, 10000)
            // //setLoading(false)
            // if (res.ResponseStatus == "OK") {
            //     Alert.alert("Thông báo", "Xóa thành công",[{ text: "Đóng" }],);
            // } else {
            //     setTimeout(() => {
            //         Alert.alert(`Lỗi`, res.ResponseMessenger, [{ text: "Đóng" }],);
            //     }, 10);
            // }
        }
        catch (error) { Alert.alert('Lỗi', error) }
    }
    //vẽ một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity>
                <View style={{borderBottomWidth: 1, marginTop: 10, borderColor: Theme.COLORS.LINE_COLOR}}>
                    <View style={{flexDirection: 'row'}}>
                        <View style={{flex: 9}}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'red'}}>{item.ItemName}</Text>
                        </View>
                        <View style={{flex: 1, alignItems:'flex-end'}}>
                            <TouchableOpacity onPress={()=>{confirmAlert(item)}}>
                                <MaterialIcons name="delete" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
                        <View style={{flex: 9}}>
                            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'green'}}>{item.ItemCode}</Text>
                        </View>
                        <View style={{flex: 1, alignItems:'flex-end'}}>
                            <Text style={{fontWeight:'bold', fontSize: 17}}>x{item.RequestQuantity}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    //vẽ màn hình danh sách chi tiết linh kiện trong phiếu yêu cầu trả linh kiện
    return (
            <View style={{flex: 1, flexDirection: 'column', padding: 10}}>
                <View>
                    <View style={[styles.backgroundColorGray, { padding: 10, borderRadius: 5}]}>
                        <Text style={styles.titleName}>Phiếu trả linh kiện mới</Text>
                        <View style={{flexDirection:'row', justifyContent: 'space-between', marginTop: 10}}>
                            <Text style={{fontSize: 15, color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{props.dataDetail.RequestNumber}</Text>
                            <Text style={{fontSize: 15, color: 'red', fontWeight:'bold'}}>{props.dataDetail.strStatus}</Text>
                        </View>
                    </View>
                    <View style={styles.searchBox}>
                        <View flex={1} style={{paddingTop: 10, paddingLeft: 10}}>
                            <FontAwesome name="search" size={20} color={Theme.COLORS.Text_COLOR_GRAY_DARK} />
                        </View>
                        <View flex={12}>
                            <TextInput
                                placeholder="Tìm kiếm..."
                                style={{fontSize: 17, height: 40, backgroundColor: 'white'}}
                            ></TextInput>
                        </View>
                    </View>
                </View>
                <View style={{flex: 1}}>
                    <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListDetails}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.keyExtra}
                    />
                </View>
            </View>
    );
};

const styles = StyleSheet.create({
    backgroundColorGray: { backgroundColor: Theme.COLORS.BACKGROUND_COLOR_GRAY_DARK, },
    titleName: { fontWeight: 'bold', fontSize: 19, color: Theme.COLORS.Text_COLOR_GRAY_DARK, },
    searchBox: {
        flexDirection: 'row', 
        marginTop: 10, 
        backgroundColor: 'white', 
        borderRadius: 5, 
        borderBottomWidth: 1, 
        borderColor: Theme.COLORS.LINE_COLOR
    },
})

export default PartsRequestReturnDetails;
