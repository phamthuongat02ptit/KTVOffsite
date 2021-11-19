import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Dimensions, TouchableOpacity, View, Text, Alert } from "react-native";

import { MaterialCommunityIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import { getFocusedRouteNameFromRoute, useIsFocused, StackActions } from "@react-navigation/native";
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Updates from "expo-updates";

import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SHCss } from "../Common/SHCss";
import AsyncStorage from "@react-native-async-storage/async-storage";

// screens
import DashBoard from "../screens/DashBoard";
import RootStackScreen from "../screens/RootStackScreen";
//man hinh ktv
import Timekeeping from "../screens/Timekeeping";
import WaitingToReceive from "../screens/WaitingToReceive";
import Received from "../screens/Received";
import Processing from "../screens/Processing";
import PartsRequest from "../screens/PartsRequest";
import RequestReturn from "../screens/RequestReturn";
import PartsRequestReturn from "../screens/PartsRequestReturn";
// import Statistical from "../screens/Statistical";
import Inventory from "../screens/Inventory";

import MapDetails from "../screens/MapDetails";
import WaitingToReceiveDetails from "../screens/WaitingToReceiveDetails";
import CreatOderPartsRequest from "../screens/createOder/CreatOderPartsRequest";
import CreatOderRequestReturn from "../screens/createOder/CreatOderRequestReturn";
import CreatOderPartsRequestReturn from "../screens/createOder/CreatOderPartsRequestReturn";
import AddItems from "../screens/createOder/AddItems";
import PartsRequestReturnDetails from "../screens/details/PartsRequestReturnDetails";
import PartsRequestDetails from "../screens/details/PartsRequestDetails";
import RequestReturnDetails from "../screens/details/RequestReturnDetails";
import InventoryDetails from "../screens/details/InventoryDetails"; 
import Cameras from "../screens/Cameras"; 
import CustomDrawerContent from "./Menu"; 
import Theme from "../constants/Theme";
import axios from "axios";
import { APIURL, SUNHOUSEKTVID, AUTHORIZATION } from "@env"


const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const HomeTabBar = (props) => {
    const notificationListener = useRef();
    const responseListener = useRef();
    const isFocused = useIsFocused();
    const ReloadApp = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update && update.isAvailable) {
                Alert.alert(
                    "Đã có phiên bản cập nhật mới",
                    "Bạn có đồng ý cập nhật phiên bản mới không?",
                    [
                        { text: "Không", onPress: async () => {}, style: "cancel" },
                        { text: "Đồng ý", onPress: async () => { await Updates.fetchUpdateAsync(); await Updates.reloadAsync() } }
                    ]
                );
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (isFocused) {
            ReloadApp();
            registerForPushNotificationsAsync();
            //  Hàm nhận biết được thông báo tới
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => { });
            //Hàm khi ấn vô thông báo (tác động)
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                const Id = response.notification.request.content.data.Id;
                props.navigation.navigate("HomeTab");
            });
        }
    }, [props, isFocused]);

    //Thông báo
    async function registerForPushNotificationsAsync() {
        let token;
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            // DUOCNC tắt thông báo
            if (finalStatus !== 'granted') {
                alert('Bạn đã không cấp quyền cho ứng dụng để thông báo, cần vào cài đặt để nhận');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            let TypeProvider = (await Notifications.getDevicePushTokenAsync()).type

            if (AsyncStorage.getItem('AccessToken_APP') != null && AsyncStorage.getItem('AccessToken_APP') != undefined) {
                saveAppUserLoginsExpo(token, TypeProvider);
            }

        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        return token;
    }


    //Lưu token của app
    const saveAppUserLoginsExpo = async (expoPushToken, loginProvider) => {
        try {
            let userStorage = await AsyncStorage.getItem('userLogin');
            let user = JSON.parse(userStorage);
            await axios.post(
                `${APIURL}/KTV/saveAppUserLoginsExpo?applicationId=${SUNHOUSEKTVID}&loginProvider=${loginProvider}&userId=${user.Id}&accessToken=${expoPushToken}`,
                {}, { headers: { Authorization: AUTHORIZATION } }
            ).then((newres) => {
                if (newres && newres.data.ResponseStatus == 'OK') {
                AsyncStorage.setItem('AccessToken_APP', expoPushToken);
                AsyncStorage.setItem('loginProvider', loginProvider);
                }
            });
        }
        catch (error) {
            //console.log(error);
        }
    }

    return (
        <View style={[SHCss.container]}>
        <DashBoard
            tabLabel={{ label: "Cá nhân", fontSize: 9, fontWeight: "bold" }}
        />
        </View>
    );
};

const HomeTab = (props) => {
    return (
        <Stack.Navigator initialRouteName="HomeTabBar">
            <Stack.Screen
                name="HomeTabBar"
                component={HomeTabBar}
                options={{
                    title: "Ca bảo hành chờ tiếp nhận",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTab")} >
                            <Ionicons name="ios-menu" size={30} color="white" onPress={() => props.navigation.openDrawer()} />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="MapDetails"
                component={MapDetailScreen}
                options={{
                    title: "Bản đồ",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("Received")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
            <Stack.Screen name="WaitingToReceiveDetails"
                component={WaitingToReceiveDetailScreen}
                options={{
                    title: "Ca bảo hành chờ tiếp nhận",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTabBar")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="Cameras"
                component={CameraScreen}
                options={{
                    title: "Camera",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("ProcessDetails")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => {  props.navigation.navigate("ProcessDetails");}} >
                            <Text style={{color: 'white', fontSize: 17, fontWeight: 'bold'}}>Lưu</Text>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="CreatOderPartsRequest"
                component={CreatOderPartsRequestScreen}
                options={{
                    title: "Tạo phiếu",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("PartsRequest")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="CreatOderRequestReturn"
                component={CreatOderRequestReturnScreen}
                options={{
                    title: "Yêu cầu trả xác",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("RequestReturn")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="CreatOderPartsRequestReturn"
                component={CreatOderPartsRequestReturnScreen}
                options={{
                    title: "Yêu cầu trả linh kiện",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("PartsRequestReturn")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="AddItems"
                component={AddItems}
                options={{
                    title: "Thêm linh kiện",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => {
                                                // if(props.route.state.routes[1].params == undefined){ props.navigation.navigate("CreatOderPartsRequest") }
                                                // else { props.navigation.navigate("PartsRequestDetails") }
                                                props.navigation.dispatch(StackActions.pop(1));
                                                }} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="PartsRequestReturnDetails"
                component={PartsRequestReturnDetailsScreen}
                options={{
                    title: "Chi tiết phiếu trả LK",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("PartsRequestReturn")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="PartsRequestDetails"
                component={PartsRequestDetailsScreen}
                options={{
                    title: "Chi tiết phiếu yêu cầu LK",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("PartsRequest")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
            <Stack.Screen name="RequestReturnDetails"
                component={RequestReturnDetailsScreen}
                options={{
                    title: "Chi tiết phiếu yêu cầu trả xác",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("RequestReturn")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
            <Stack.Screen name="InventoryDetails"
                component={InventoryDetailsScreen}
                options={{
                    title: "Chi tiết tồn kho",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("Inventory")} >
                            <Ionicons name="chevron-back" size={24} color="white"/>
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: Theme.COLORS.GREEN_PORTAL },
                    headerTitleAlign: "center",
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" }
                }}
            />
        </Stack.Navigator>
    );
};
//man hinh chi tiet ca bao hanh cho tiep nhan
function WaitingToReceiveDetailScreen(props) {
    return (
        <WaitingToReceiveDetails dataDetail={props.route.params} />
    );
}
//man hinh google map
function MapDetailScreen(props) { 
    return (
        <MapDetails dataDetail={props.route.params} />
    );
}
//man hinh tao phiếu yêu cầu linh kiện
function CreatOderPartsRequestScreen(props) {
    return (
        <CreatOderPartsRequest dataDetail={props.route.params}/>
    );
}
//man hinh tao phiếu yêu cầu trả xác
function CreatOderRequestReturnScreen(props) {
    return (
        <CreatOderRequestReturn dataDetail={props.route.params}/>
    );
}
//man hinh tao phiếu yêu cầu trả linh kiện
function CreatOderPartsRequestReturnScreen(props) {
    return (
        <CreatOderPartsRequestReturn dataDetail={props.route.params}/>
    );
}

//man hinh chi tiết phiếu trả linh kiện theo số yêu cầu
function PartsRequestReturnDetailsScreen(props) {
    return (
        <PartsRequestReturnDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi tiết phiếu yêu cầu linh kiện theo số yêu cầu
function PartsRequestDetailsScreen(props) {
    return (
        <PartsRequestDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi tiết phiếu trả xác theo số yêu cầu
function RequestReturnDetailsScreen(props) {
    return (
        <RequestReturnDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi tiết tồn kho linh kiện
function InventoryDetailsScreen(props) {
    return (
        <InventoryDetails dataDetail={props.route.params}/>
    );
}
//man hinh camera
function CameraScreen(props) {
    return (
        <Cameras dataDetail={props.route.params}/>
    );
}
function HomeTabBottom(props) {
    return (
        <Tab.Navigator activeColor="#f0edf6" inactiveColor="#3e2465" barStyle={{ backgroundColor: '#694fad' }} tabBarOptions={{ }}>
            <Tab.Screen
                name="HomeTab"
                component={HomeTab} 
                options={({ route }) => ({
                    tabBarLabel: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => ( <MaterialCommunityIcons name="home" color={color} size={size} /> ),
                    tabBarVisible: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? ""        
                        if (routeName === "AddTask") { return false }        
                        return true
                    })(route),
                })}
            /> 
            <Tab.Screen name="Timekeeping" component={Timekeeping} options={{ tabBarLabel: "Chấm công", tabBarButton: () => null }} />
            <Tab.Screen
                name="WaitingToReceive"
                component={WaitingToReceive}
                options={{
                    tabBarLabel: "Chờ tiếp nhận",
                    tabBarButton: () => null,
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="hourglass-2" color={color} size={size-6} /> ),
                }}
            />
            <Tab.Screen
                name="Received"
                component={Received}
                options={{
                    tabBarLabel: "Đã tiếp nhận",
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="sign-in" color={color} size={size-2} /> ),
                }}
            />
            <Tab.Screen
                name="Processing"
                component={Processing}
                options={{
                    tabBarLabel: "Đang xử lý",
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="wrench" color={color} size={size-4} /> ),
                }}
            />
            <Tab.Screen
                name="PartsRequest"
                component={PartsRequest}
                options={{ tabBarLabel: "Yêu cầu linh kiện", tabBarButton: () => null }}
            />
            <Tab.Screen
                name="RequestReturn"
                component={RequestReturn}
                options={{ tabBarLabel: "Yêu cầu trả xác", tabBarButton: () => null }}
            />
            <Tab.Screen
                name="PartsRequestReturn"
                component={PartsRequestReturn}
                options={{ tabBarLabel: "Yêu cầu trả linh kiện", tabBarButton: () => null }}
            />
            {/* <Tab.Screen
                name="Statistical"
                component={Statistical}
                options={{ tabBarLabel: "Thống kê", tabBarButton: () => null }}
            /> */}
            <Tab.Screen
                name="Inventory"
                component={Inventory}
                options={{ tabBarLabel: "Tồn kho", tabBarButton: () => null }}
            />
        </Tab.Navigator>
    );
}
export default function Screen(props) {
    const [router, setRouter] = useState(null);
    useEffect(() => {
        getToken();
    }, []);

    const getToken = async () => {
        let userStorage = await AsyncStorage.getItem('userLogin');
        let user = JSON.parse(userStorage);
        if (user && user != null) {
            setRouter("App");
        } else {
            setRouter("RootStackScreen");
        }
    }

    return (
        <View style={{flex: 1}}>
        {
            router == null ? null :
                <Stack.Navigator
                    initialRouteName={router}
                    mode="card"
                    headerMode="none">
                    <Stack.Screen name="RootStackScreen" component={RootStackScreen} option={{ headerTransparent: true }} />
                    <Stack.Screen name="App" component={AppStack} />
                </Stack.Navigator>
        }
        </View>
    )
}

function AppStack(props) {
    return (
        <Drawer.Navigator
            style={{ flex: 1 }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            drawerStyle={{ backgroundColor: "white", width: width * 0.8, }}
            drawerContentOptions={{
                activeTintcolor: "white",
                inactiveTintColor: "#000",
                activeBackgroundColor: "transparent",
                itemStyle: {
                width: width * 0.75,
                backgroundColor: "transparent",
                paddingVertical: 16,
                paddingHorizonal: 12,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                overflow: "hidden",
                },
                labelStyle: {
                fontSize: 18,
                marginLeft: 12,
                fontWeight: "normal",
                },
            }}
            initialRouteName="Home"
        >
        <Drawer.Screen name="Home" component={HomeTabBottom} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    iconStyle: {
        fontSize: 40,
        marginTop: 30,
        color: "black",
    },
});