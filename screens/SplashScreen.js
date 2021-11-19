import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    StatusBar,
    Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Images } from '../constants';
import ViewSlider from 'react-native-view-slider';
import Theme from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
    const { colors } = useTheme();

    const onStart = async (role) => {
        AsyncStorage.getItem(
            "userLogin"
        ).then(user => {
            if (user) user = JSON.parse(user);
            if (user && user != undefined && user != null) {
                navigation.navigate("App");
            } else {
                navigation.navigate('SignInScreen', { role: role })
            }
        });
    }

    return (
        <View style={styles.container}>
            {/* <StatusBar backgroundColor='#009387' barStyle="light-content"/> */}
            <View style={styles.header}>

                <Animatable.Image
                    animation="bounceIn"
                    duraton="1500"
                    source={Images.logologinshg}
                    style={styles.logo}
                    resizeMode="stretch"
                />
            </View>
            <Animatable.View
                style={[styles.footer, {
                    backgroundColor: colors.background
                }]}
                animation="fadeInUpBig"
            >
                <Text style={[styles.title, {
                    color: colors.text
                }]}>ỨNG DỤNG BẢO HÀNH ONSITE</Text>
                <View flexDirection="row">
                    <View style={styles.button}>
                        <TouchableOpacity onPress={()=>{onStart('wdm')}}>
                            <LinearGradient
                                colors={['#08d4c4', '#01ab9d']}
                                style={styles.signIn}
                            >
                                <Text style={styles.textSign}>TRẠM/CTV</Text>
                                <MaterialIcons
                                    name="navigate-next"
                                    color="#fff"
                                    size={20}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity onPress={()=>{onStart('ktv')}}>
                            <LinearGradient
                                colors={['#08d4c4', '#01ab9d']}
                                style={styles.signIn}
                            >
                                <Text style={styles.textSign}>KỸ THUẬT VIÊN</Text>
                                <MaterialIcons
                                    name="navigate-next"
                                    color="#fff"
                                    size={20}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animatable.View>
        </View>
    );
};

export default SplashScreen;

const { height } = Dimensions.get("screen");
const height_logo = height * 0.6;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#009387'
    },
    header: {
        flex: 2,
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 50,
        paddingHorizontal: 30
    },
    logo: {
        width: height_logo,
        height: height_logo
    },
    title: {
        color: '#05375a',
        fontSize: 20,
        fontWeight: 'bold'
    },
    text: {
        color: 'grey',
        marginTop: 5
    },
    button: {
        alignItems: 'center',
        marginTop: 30,
        flex: 1
    },
    signIn: {
        width: 150,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            android: {
                borderRadius: 50,
            },
            ios: {
                borderRadius: 20,
            },
        }),
        flexDirection: 'row'
    },
    textSign: {
        color: 'white',
        fontWeight: 'bold'
    },
    viewBox: {
        justifyContent: 'center',
        width: Dimensions.get('window').width,
        padding: 10,
        alignItems: 'center',
        height: 300
    },
    slider: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: Theme.COLORS.GREEN_PORTAL
    },
    dotContainer: {
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 0,
    },
    imageslide: {
        height: 280,
        width: Dimensions.get('window').width
    }
});

