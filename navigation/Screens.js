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
                    "??a?? co?? phi??n ba??n c????p nh????t m????i",
                    "Ba??n co?? ??????ng y?? c????p nh????t phi??n ba??n m????i kh??ng?",
                    [
                        { text: "Kh??ng", onPress: async () => {}, style: "cancel" },
                        { text: "??????ng y??", onPress: async () => { await Updates.fetchUpdateAsync(); await Updates.reloadAsync() } }
                    ]
                );
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (isFocused) {
            ReloadApp();
            registerForPushNotificationsAsync();
            //  Ha??m nh????n bi????t ????????c th??ng ba??o t????i
            notificationListener.current = Notifications.addNotificationReceivedListener(notification => { });
            //Ha??m khi ????n v?? th??ng ba??o (ta??c ??????ng)
            responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
                const Id = response.notification.request.content.data.Id;
                props.navigation.navigate("HomeTab");
            });
        }
    }, [props, isFocused]);

    //Th??ng ba??o
    async function registerForPushNotificationsAsync() {
        let token;
        if (Constants.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            // DUOCNC t????t th??ng ba??o
            if (finalStatus !== 'granted') {
                alert('Ba??n ??a?? kh??ng c????p quy????n cho ????ng du??ng ?????? th??ng ba??o, c????n va??o ca??i ??????t ?????? nh????n');
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


    //L??u token cu??a app
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
            tabLabel={{ label: "Ca?? nh??n", fontSize: 9, fontWeight: "bold" }}
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
                    title: "Ca b???o h??nh ch???? ti????p nh????n",
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
                    title: "B???n ?????",
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
                    title: "Ca b???o h??nh ch??? ti???p nh???n",
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
                            <Text style={{color: 'white', fontSize: 17, fontWeight: 'bold'}}>L??u</Text>
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
                    title: "T???o phi???u",
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
                    title: "Y??u c???u tr??? x??c",
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
                    title: "Y??u c???u tr??? linh ki???n",
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
                    title: "Th??m linh ki???n",
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
                    title: "Chi ti???t phi???u tr??? LK",
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
                    title: "Chi ti???t phi???u y??u c????u LK",
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
                    title: "Chi ti???t phi???u y??u c????u tra?? xa??c",
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
                    title: "Chi ti???t t????n kho",
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
//man hinh tao phi???u y??u c???u linh ki???n
function CreatOderPartsRequestScreen(props) {
    return (
        <CreatOderPartsRequest dataDetail={props.route.params}/>
    );
}
//man hinh tao phi???u y??u c???u tr??? x??c
function CreatOderRequestReturnScreen(props) {
    return (
        <CreatOderRequestReturn dataDetail={props.route.params}/>
    );
}
//man hinh tao phi???u y??u c???u tr??? linh ki???n
function CreatOderPartsRequestReturnScreen(props) {
    return (
        <CreatOderPartsRequestReturn dataDetail={props.route.params}/>
    );
}

//man hinh chi ti???t phi???u tr??? linh ki???n theo s??? y??u c???u
function PartsRequestReturnDetailsScreen(props) {
    return (
        <PartsRequestReturnDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi ti???t phi???u y??u c????u linh ki???n theo s??? y??u c???u
function PartsRequestDetailsScreen(props) {
    return (
        <PartsRequestDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi ti???t phi???u tr??? xa??c theo s??? y??u c???u
function RequestReturnDetailsScreen(props) {
    return (
        <RequestReturnDetails dataDetail={props.route.params}/>
    );
}
//man hinh chi ti???t t????n kho linh ki????n
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
                    tabBarLabel: 'Trang chu??',
                    tabBarIcon: ({ color, size }) => ( <MaterialCommunityIcons name="home" color={color} size={size} /> ),
                    tabBarVisible: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? ""        
                        if (routeName === "AddTask") { return false }        
                        return true
                    })(route),
                })}
            /> 
            <Tab.Screen name="Timekeeping" component={Timekeeping} options={{ tabBarLabel: "Ch???m c??ng", tabBarButton: () => null }} />
            <Tab.Screen
                name="WaitingToReceive"
                component={WaitingToReceive}
                options={{
                    tabBarLabel: "Ch??? ti???p nh???n",
                    tabBarButton: () => null,
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="hourglass-2" color={color} size={size-6} /> ),
                }}
            />
            <Tab.Screen
                name="Received"
                component={Received}
                options={{
                    tabBarLabel: "???? ti???p nh???n",
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="sign-in" color={color} size={size-2} /> ),
                }}
            />
            <Tab.Screen
                name="Processing"
                component={Processing}
                options={{
                    tabBarLabel: "??ang x??? l??",
                    tabBarIcon: ({ color, size }) => ( <FontAwesome name="wrench" color={color} size={size-4} /> ),
                }}
            />
            <Tab.Screen
                name="PartsRequest"
                component={PartsRequest}
                options={{ tabBarLabel: "Y??u c???u linh ki???n", tabBarButton: () => null }}
            />
            <Tab.Screen
                name="RequestReturn"
                component={RequestReturn}
                options={{ tabBarLabel: "Y??u c???u tr??? x??c", tabBarButton: () => null }}
            />
            <Tab.Screen
                name="PartsRequestReturn"
                component={PartsRequestReturn}
                options={{ tabBarLabel: "Y??u c???u tr??? linh ki???n", tabBarButton: () => null }}
            />
            {/* <Tab.Screen
                name="Statistical"
                component={Statistical}
                options={{ tabBarLabel: "Th???ng k??", tabBarButton: () => null }}
            /> */}
            <Tab.Screen
                name="Inventory"
                component={Inventory}
                options={{ tabBarLabel: "T???n kho", tabBarButton: () => null }}
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