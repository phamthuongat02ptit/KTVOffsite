import React, { useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View, FlatList} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { GetApis } from "../../Common/CallApi";
import Theme from '../../constants/Theme';

//Màn hình chi tiết tồn kho
//Thuongpv 20210812
const Inventory = (props) => {
    const [ListDetails, setListDetails] = useState([]); //biến danh sách chi tiết tồn kho

    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            getListDetails();
        }
    }, [props, isFocused]);

    //lấy danh sách chi tiết tồn kho linh kiện
    const getListDetails = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = '';
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetReportInventoryDetailByItemCode',
                {
                    ItemCode: props.dataDetail.ItemCode,
                    loginUser: userName,
                },
                10000
            ).then((newres) => {
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                        setListDetails(data);
                    } else { setListDetails([]); }
                }
            });
        }
        catch (error) { }
    }

    //vẽ một item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity>
                <View style={{marginTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: Theme.COLORS.LINE_COLOR}}>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <View flex={1}>
                            <Text style={{fontWeight: 'bold', color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.RequestNumber}</Text>
                        </View>
                        <View flex={3}>
                            <Text style={{color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>Yêu cầu: {item.strRequestDate} - SL: {item.RequestQuantity}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', marginTop: 5}}>
                        <View flex={1}>
                            <Text style={{color: 'red'}}>{item.strApproval}</Text>
                        </View>
                        <View flex={3}>
                            <Text style={{color: 'blue'}}>Duyệt {item.strApprovalDate} - SL: {item.ReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //vẽ danh sách chi tiết tồn kho
    return (
        <ScrollView>
            <View style={{padding: 10}}>
                <View>
                    <View style={[styles.backgroundColorGray, { padding: 10, borderRadius: 5}]}>
                        <Text style={styles.titleName}>{props.dataDetail.ItemName}</Text>
                        <View style={{flexDirection:'row', justifyContent: 'space-between', marginTop: 10}}>
                            <Text style={{fontSize: 15, color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{props.dataDetail.ItemCode}</Text>
                            <Text style={{fontSize: 15, color: 'red', fontWeight:'bold'}}>Tồn {props.dataDetail.ReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
                <ScrollView>
                    <View>
                        <FlatList
                            style={{ paddingTop: 2, paddingBottom: 2 }}
                            data={ListDetails}
                            renderItem={RenderItem}
                            keyExtractor={(item) => item.RequestNumber}
                        />
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
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
    }
})

export default Inventory;
