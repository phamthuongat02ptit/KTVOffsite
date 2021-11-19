import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import Theme from '../constants/Theme';
import DashBoard from "../screens/DashBoard";

const Stack = createStackNavigator();

const WaitingToReceiveComponent = (props) => {
    return (
        <DashBoard/>
    )
}

const WaitingToReceive = (props) => {
    return (
        <Stack.Navigator initialRouteName="WaitingToReceiveComponent">
            <Stack.Screen
                name="WaitingToReceiveComponent"
                component={WaitingToReceiveComponent}
                options={{
                    title: "Ca bảo hành chờ tiếp nhận",
                    headerLeft: () => (
                        <TouchableOpacity style={{ marginHorizontal: 10 }} onPress={() => props.navigation.navigate("HomeTab")} >
                            <Ionicons name="ios-menu" size={30} color="white" onPress={() => props.navigation.openDrawer()} />
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

export default WaitingToReceive;