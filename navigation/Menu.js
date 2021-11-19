import React, { useState, useEffect } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSafeArea } from "react-native-safe-area-context";
import {  ScrollView,  StyleSheet,  Image,   View,  Alert} from "react-native";
import { Block, Text, theme } from "galio-framework";
import Images from "../constants/Images";
import { DrawerItem as DrawerCustomItem } from '../components';
import AsyncStorage from "@react-native-async-storage/async-storage";

function CustomDrawerContent({ drawerPosition, navigation, profile, focused, state, ...rest }) {
    const insets = useSafeArea();
    const [screens, setScreens] = useState([]);
    useEffect(() => { getRoles(); }, []);
    const getRoles = async () => {
        let roles = await AsyncStorage.getItem('Role');
        if(roles == "wdm" || roles == "ktvwdm"){
            setScreens([
                {Key: "HomeTab",Name:'Trang chủ'},
                {Key: "WaitingToReceive",Name:'Chờ tiếp nhận'},
                {Key: "Received",Name:'Đã tiếp nhận'},
                {Key: "Processing",Name:'Đang xử lý'},
                {Key: "Logout",Name:'Đăng xuất'},
            ]); 
        }else {
            setScreens([
                {Key: "HomeTab",Name:'Trang chủ'},
                {Key: "Timekeeping",Name:'Chấm công'},
                {Key: "WaitingToReceive",Name:'Chờ tiếp nhận'},
                {Key: "Received",Name:'Đã tiếp nhận'},
                {Key: "Processing",Name:'Đang xử lý'},
                {Key: "PartsRequest",Name:'Yêu cầu linh kiện'},
                {Key: "RequestReturn",Name:'Yêu cầu trả xác'},
                {Key: "PartsRequestReturn",Name:'Yêu cầu trả linh kiện'},
                // {Key: "Statistical",Name:'Thống kê'},
                {Key: "Inventory",Name:'Tồn kho linh kiện'},
                {Key: "Logout",Name:'Đăng xuất'},
            ]); 
        }
    }

    const [username, setUsername] = useState('...loading');
    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
        getInfoLogin();
        }
    }, [username]);
    //lấy ra thông tin đăng nhập
    const getInfoLogin = async () => {
        try {
            var userLogin = await AsyncStorage.getItem('userLogin');
            if (userLogin && JSON.parse(userLogin) != null)
                setUsername(JSON.parse(userLogin).UserName);
        }
        catch (error) {
            Alert.alert(JSON.stringify(error));
        }
    }
    return (
        <Block
            style={styles.container}
            forceInset={{ top: 'always', horizontal: 'never' }}
        >
        <Block flex={0.06} style={styles.header}>
            <View style={{flexDirection: 'row'}}>
                <Image style={styles.logo} source={Images.LogoMenuKTV} />
                <View style={styles.textInfo}>
                    <Text style={styles.textInfo}>{username}</Text>
                    <Text style={styles.textStatus}>
                        <View style={{width: 10, height: 10, borderRadius: 10, backgroundColor: 'green'}}></View>  online
                    </Text>
                </View>
            </View>
        </Block>
        <Block flex style={{ paddingLeft: 8, paddingRight: 14 }}>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {screens.map((item, index) => {
                    return (
                        <DrawerCustomItem
                        title={item.Name}
                        index= {item.Key}
                        key={index}
                        navigation={navigation}
                        focused={state.index === index ? true : false}
                        />
                    );
                })}
                <Block flex style={{ marginTop: 24, marginVertical: 8, paddingHorizontal: 8 }}>
                    <Block style={{ borderColor: "rgba(0,0,0,0.2)", width: '100%', borderWidth: StyleSheet.hairlineWidth }}/>
                </Block>
            </ScrollView>
        </Block>
        </Block>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 10,
        paddingBottom: theme.SIZES.BASE,
        paddingTop: theme.SIZES.BASE * 3,
        justifyContent: 'center'
    },
    logo:{
        flex: 1,
        width: 70,
        height: 50,
        resizeMode: 'contain'
    },
    textInfo: {
        flex: 2,
        paddingLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#818181'
    },
    textStatus: {
        flex: 2,
        paddingLeft: 10,
        fontSize: 17,
        color: '#818181'
    }
});

export default CustomDrawerContent;
