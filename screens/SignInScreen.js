import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform, StyleSheet, StatusBar, Alert} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import { showMessage } from 'react-native-flash-message';
import Logo from '../components/controls/Logo';
import * as actionsLogin from "../Redux/Action/login";
import * as actionsLoading from "../Redux/Action/loading";
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
    return { ...state };
};

const SignInScreen = ({ navigation, ...props }) => {
    const [localState, setLocalState] = useState({
        userName: null,
        passWord: null,
        loading: false
    });

    const [data, setData] = React.useState({
        username: '',
        password: '',
        check_textInputChange: false,
        secureTextEntry: true,
        isValidUser: true,
        isValidPassword: true,
    });

    const { colors } = useTheme();

    const updateSecureTextEntry = () => {
        setData({
            ...data,
            secureTextEntry: !data.secureTextEntry
        });
    }

    const handleValidUser = (val) => {
        if (val.trim().length >= 4) {
            setData({
                ...data,
                isValidUser: true
            });
        } else {
            setData({
                ...data,
                isValidUser: false
            });
        }
    }

    /**
     * login 
     * @param {*} userName 
     * @param {*} password 
     * @returns 
     */
    var loginHandle = async () => {
        try {
            if (localState.userName == null || localState.userName == "") {
                showMessage({
                    type: 'warning',
                    message: 'Bạn chưa nhập tài khoản',
                    position: 'top',
                });
                return;
            }
            if (localState.passWord == null || localState.passWord == "") {
                showMessage({
                    type: 'warning',
                    message: 'Bạn chưa nhập mật khẩu',
                    position: 'top'
                });
                return;
            }
            props.ToggleLoading(true);
            await props.LoginApp(localState.userName, localState.passWord,props.route.params.role);
            props.ToggleLoading(false);
             AsyncStorage.getItem(
                "userLogin"
            ).then(user => {
                if (user) user = JSON.parse(user);

                if (user && user.UserName.toLowerCase() == localState.userName.toLowerCase()) {
                    props.ToggleLoading(false);
                    navigation.navigate("App");
                }
                else {
                    Alert.alert("Lỗi","tài khoản mật khẩu không chính xác");
                }
            });
        } catch (error) {
            Alert.alert(JSON.stringify(error));
        }
    }

    useEffect(() => {
        setTimeout(() => {
            // AsyncStorage.removeItem("userLogin");
            //Kiểm tra người dùng đăng nhập hay chưa, nếu chưa thì tới màn hình login
            AsyncStorage.getItem("userLogin").then((value) => {
                if (!props.userLogin) {
                    props.SetInfoLogin(JSON.parse(value));
                }
                if (value) {
                    navigation.replace("App");
                }
            });
        }, 1000);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor='#009387' barStyle="light-content" />
            <View style={styles.header}>
                {<Logo />}
            </View>
            <Animatable.View
                animation="fadeInUpBig"
                style={[styles.footer, {
                    backgroundColor: colors.background
                }]}
            >
                <Text style={[styles.text_footer, {
                    color: colors.text
                }]}>Tài khoản</Text>
                <View style={styles.action}>
                    <FontAwesome
                        name="user-o"
                        color={colors.text}
                        size={20}
                    />
                    <TextInput
                        placeholder="Nhập tài khoản"
                        placeholderTextColor="#666666"
                        style={[styles.textInput, {
                            color: colors.text
                        }]}
                        autoCapitalize="none"
                        onChangeText={(value) => setLocalState((preState) => ({ ...preState, userName: value }))}
                        onEndEditing={(e) => handleValidUser(e.nativeEvent.text)}
                    />
                    {data.check_textInputChange ?
                        <Animatable.View animation="bounceIn" >
                            <Feather
                                name="check-circle"
                                color="green"
                                size={20}
                            />
                        </Animatable.View>
                        : null}
                </View>

                <Text style={[styles.text_footer, {
                    color: colors.text,
                    marginTop: 35
                }]}>Mật khẩu</Text>
                <View style={styles.action}>
                    <Feather
                        name="lock"
                        color={colors.text}
                        size={20}
                    />
                    <TextInput
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="#666666"
                        secureTextEntry={data.secureTextEntry ? true : false}
                        style={[styles.textInput, {
                            color: colors.text
                        }]}
                        autoCapitalize="none"
                        onChangeText={(value) => setLocalState((preState) => ({ ...preState, passWord: value }))}
                    />
                    <TouchableOpacity
                        onPress={updateSecureTextEntry}
                    >
                        {data.secureTextEntry ?
                            <Feather
                                name="eye-off"
                                color="grey"
                                size={20}
                            />
                            :
                            <Feather
                                name="eye"
                                color="grey"
                                size={20}
                            />
                        }
                    </TouchableOpacity>
                </View>
                {/* <TouchableOpacity onPress={() => { Alert.alert("Tính năng đang phát triển!") }} >
                    <Text style={{ color: '#009387', marginTop: 15 }}>Quên mật khẩu?</Text>
                </TouchableOpacity> */}
                <View style={styles.button}>
                    <TouchableOpacity
                        style={styles.signIn}
                        onPress={loginHandle.bind(this)}
                    >
                        <LinearGradient
                            colors={['#08d4c4', '#01ab9d']}
                            style={styles.signIn}
                        >
                            <Text style={[styles.textSign, {
                                color: '#fff'
                            }]}>Đăng nhập</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animatable.View>
        </View>
    );
};

export default connect(mapStateToProps, { ...actionsLogin, ...actionsLoading })(SignInScreen);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#009387' },
    header: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 50 },
    footer: { flex: 3, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingVertical: 30 },
    text_header: { color: '#fff', fontWeight: 'bold', fontSize: 30 },
    text_footer: { color: '#05375a', fontSize: 18 },
    action: { flexDirection: 'row', marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#f2f2f2', paddingBottom: 5 },
    actionError: { flexDirection: 'row', marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#FF0000', paddingBottom: 5 },
    textInput: { flex: 1, marginTop: Platform.OS === 'ios' ? 0 : -12, paddingLeft: 10, color: '#05375a', },
    errorMsg: { color: '#FF0000', fontSize: 14, },
    button: { alignItems: 'center', marginTop: 50 },
    signIn: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
    textSign: { fontSize: 18, fontWeight: 'bold' }
});
