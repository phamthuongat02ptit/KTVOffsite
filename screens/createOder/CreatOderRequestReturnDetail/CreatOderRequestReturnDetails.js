import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, View, Alert, TextInput, FlatList, TouchableOpacity} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { GetApis } from "../../../Common/CallApi";
import Theme from '../../../constants/Theme';
import { Button } from "react-native-paper";

const CreatOderRequestReturnDetails = () => {
    //vẽ màn hình danh sách đã chọn linh kiện cần trả xác và không cần trả xác
    return (
        <ScrollView>
            <View style={{padding: 10}}>
                <Text style={{fontSize: 17, marginTop: 10}}>Tìm kiếm</Text>
                <View style={{ marginTop: 10}}>
                    <TextInput
                    style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
                    placeholder="Tìm kiếm ..."
                    />
                </View>
            </View>
            <View style={{backgroundColor: Theme.COLORS.GREEN_KTV , color:'white', borderRadius: 5, margin: 10}}>
                <Button color='white'>TẠO PHIẾU</Button>
            </View>
        </ScrollView>
    );
}
export default CreatOderRequestReturnDetails;