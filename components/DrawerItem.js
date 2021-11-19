import React from "react";
import { StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { Block, Text, theme } from "galio-framework";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "./Icon";
import argonTheme from "../constants/Theme";
import Theme from "../constants/Theme";
import axios from "axios";
import { APIURL, SUNHOUSEKTVID, AUTHORIZATION } from "@env"

class DrawerItem extends React.Component {
    renderIcon = () => {
        const { title, focused, index } = this.props;
        switch (index) {
            case "HomeTab":
                return (
                    <Icon name="shop" family="ArgonExtra" size={18} 
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "Timekeeping":
                return (
                    <Icon name="fingerprint" family="Entypo" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "WaitingToReceive":
                return (
                    <Icon name="hourglass-2" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "Received":
                return (
                    <Icon name="sign-in" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "Processing":
                return (
                    <Icon name="wrench" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "PartsRequest":
                return (
                    <Icon name="arrow-circle-right" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "RequestReturn":
                return (
                    <Icon name="share-square" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "PartsRequestReturn":
                return (
                    <Icon name="arrow-circle-left" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            // case "Statistical":
            //     return (
            //         <Icon name="pie-chart" family="FontAwesome" size={18}
            //             color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
            //     );
            case "Inventory":
                return (
                    <Icon name="cubes" family="FontAwesome" size={18}
                        color={focused ? "white" : argonTheme.COLORS.DEFAULT} />
                );
            case "Logout":
                return (
                    <Icon name="logout" family="MaterialIcons" size={18}
                        color={argonTheme.COLORS.WARNING}
                    />
                );
            default:
                return null;
        }
    };

    render() {
        const { focused, title, index, navigation } = this.props;
        const containerStyles = [
            styles.defaultStyle,
            focused ? [styles.activeStyle, styles.shadow] : null
        ];
        const clearTokenLoginsExpo = async () => {
            try {
                let userStorage = await AsyncStorage.getItem('userLogin');
                let user = JSON.parse(userStorage);
                let loginProvider = await AsyncStorage.getItem('loginProvider');
                let Token = await AsyncStorage.getItem('AccessToken_APP');
                await axios.post(
                    `${APIURL}/KTV/saveAppUserLoginsExpo?applicationId=${SUNHOUSEKTVID}&loginProvider=${loginProvider}&userId=${user.Id}&accessToken=${Token}`,
                    {}, {
                            headers: {
                                Authorization: AUTHORIZATION,
                            },
                        }
                ).then((newres) => {
                    if (newres && newres.data.ResponseStatus == 'OK') {
                        //console.log("Clear TK succes");
                    }
                });
                AsyncStorage.clear();
                navigation.replace('RootStackScreen');
            }
            catch (error) {
                //console.log(error);
            }
        }

        return (
            <TouchableOpacity
                style={{ height: 60 }}
                onPress={() => {
                    if (index == "Logout") {
                        navigation.toggleDrawer();
                        Alert.alert(
                            'Đăng xuất',
                            'Bạn có chắc muốn đăng xuất không?',
                            [
                                {
                                    text: 'Đồng ý',
                                    style: { color: argonTheme.COLORS.ERROR },
                                    onPress: () => { clearTokenLoginsExpo(); },
                                },
                                { text: 'Không', onPress: () => { return null } },
                            ],
                            { cancelable: false },
                        );
                    } else navigation.navigate(index)
                }}
            >
                <Block flex row style={containerStyles}>
                    <Block middle flex={0.1} style={{ marginRight: 5 }}>
                        {this.renderIcon()}
                    </Block>
                    <Block row center flex={0.9}>
                        <Text size={15} bold={focused ? true : false} color={focused ? "white" : "rgba(0,0,0,0.5)"} >
                            {title}
                        </Text>
                    </Block>
                </Block>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    iconStyle: { fontSize: 40, marginTop: 30, color: 'black', },
    textStyle: { marginTop: 5, color: 'black', },
    defaultStyle: { paddingVertical: 16, paddingHorizontal: 16, },
    activeStyle: {    backgroundColor: Theme.COLORS.GREEN_PORTAL,    borderRadius: 4  },
    shadow: {
        shadowColor: theme.COLORS.BLACK,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 0.1
    }
});

export default DrawerItem;
