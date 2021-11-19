import React, { useState, useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { GetApis } from "../Common/CallApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Theme from '../constants/Theme';
import SHModelInput from "../components/controls/SHModelInput";
import { ScrollView } from "react-native-gesture-handler";

const Stack = createStackNavigator();
//Màn hình danh sách tồn kho linh kiện
//Thuongpv 20210812
const InventoryComponent = (props) => {
    const navigation = useNavigation();
    const [ListInventory, setListInventory] = useState([]); //biến danh sách linh kiện tồn kho

    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
        getListInventory();
        }
    }, [props, isFocused]);

    //lấy ra danh sách tồn kho linh kiện theo user
    const getListInventory = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            var userName = ''; 
            if (userLogin && JSON.parse(userLogin) != null)
                userName = JSON.parse(userLogin).UserName;
            await GetApis('KTV', 'GetReportInventory',
                {   
                    fromDate: '2021-07-01',
                    toDate: '2021-08-11',
                    loginUser: userName,
                },
                10000
            ).then((newres) => { 
                if (newres && newres.ResponseStatus == 'OK') {
                    const data = newres.ResponseData;
                    if (data != undefined) {
                        setListInventory(data);
                    } else { setListInventory([]); }
                }
            });
        }
        catch (error) { }
    }

    // Hàm chuyển sang màn hình InventoryDetails
    const InventoryDetailsOnPress = (item) => {
       navigation.navigate('InventoryDetails', item);
    }
    //vẽ 1 item
    const RenderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => InventoryDetailsOnPress(item)}>
                <View style={{marginTop: 10, borderBottomWidth: 1, paddingBottom: 5, marginLeft: 10, marginRight: 10, borderColor: Theme.COLORS.LINE_COLOR}}>
                    <View>
                        <Text style={{fontWeight: 'bold', color:'blue'}}>{item.ItemName}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginTop: 5}}>
                        <View style={{flex: 6}}>
                            <Text style={{color: Theme.COLORS.Text_COLOR_GRAY_DARK}}>{item.ItemCode}</Text>
                        </View>
                        <View style={{flex: 1, alignItems:'flex-end'}}>
                            <Text style={{fontWeight:'bold', color: 'red'}}>Tồn: {item.ReceiveQuantity}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    //vẽ màn hình danh sách linh kiện tồn kho
    return (
            <View style={styles.container}>
                <View>
                    <SHModelInput onPress={() => { }}/>
                </View>
                <ScrollView>
                    <View>
                        <FlatList
                        style={{ paddingTop: 2, paddingBottom: 2 }}
                        data={ListInventory}
                        renderItem={RenderItem}
                        keyExtractor={(item) => item.ItemCode}
                        />
                    </View>
                </ScrollView>
            </View>
    )
}

const Inventory = (props) => {
    return (
        <Stack.Navigator initialRouteName="InventoryComponent">
            <Stack.Screen
                name="InventoryComponent"
                component={InventoryComponent}
                options={{
                    title: "Tồn kho",
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
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },

})

export default Inventory;