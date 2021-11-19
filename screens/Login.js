import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, theme } from "galio-framework";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showMessage } from "react-native-flash-message";

import * as actionsLogin from "../Redux/Action/login";
import * as actionsLoading from "../Redux/Action/loading";
import Logo from "../components/controls/Logo";
import Theme from "../constants/Theme";

const mapStateToProps = (state) => {
  return { ...state };
};

const LoginScreen = ({ navigation, ...props }) => {
  const [localState, setLocalState] = useState({
    userName: 'trieupv',
    passWord: 'phamtrieu',
    loading: false
  })

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

  var onLogin = async () => {
    try {
      if (!localState.userName) {
        showMessage({
          type: 'warning',
          message: 'Bạn chưa điền tài khoản',
          position: 'top'
        });
        return;
      }
      if (!localState.passWord) {
        showMessage({
          type: 'warning',
          message: 'Bạn chưa điền mật khẩu',
          position: 'top'
        });
        return;
      }
      //console.log(localState);
      // setLocalState((preState) =>({...preState,loading:true}));
      // props.ToggleLoading(true);
      props.ToggleLoading(true);
      await props.LoginApp(localState.userName, localState.passWord);
      props.ToggleLoading(false);
      AsyncStorage.getItem(
        "userLogin"
      ).then(user => {
        if (user) user = JSON.parse(user);
        
        if (user && user.usr_id.toLowerCase() == localState.userName.toLowerCase()) {
          props.ToggleLoading(false);
          navigation.navigate("App");
        }
      });
    } catch (error) {
      Alert.alert(JSON.stringify(newres));
    }
  };

  return (
    <View style={[styles.container]}>
      {<Logo />}
      <View style={{ marginBottom: 30 }}></View>
      <TextInput
        value={localState.userName}
        onChangeText={(value) => setLocalState((preState) => ({ ...preState, userName: value }))}
        placeholder='Tài khoản'
        placeholderTextColor={theme.COLORS.SECONDARY}
        style={styles.input}
      />
      <TextInput
        value={localState.passWord}
        onChangeText={(value) => setLocalState((preState) => ({ ...preState, passWord: value }))}
        placeholder={'Mật khẩu'}
        secureTextEntry={true}
        placeholderTextColor={theme.COLORS.SECONDARY}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={onLogin.bind(this)}>
        <Text style={styles.buttonText}> Đăng nhập </Text>
      </TouchableOpacity>
    </View>
  );
}

export default connect(mapStateToProps, { ...actionsLogin, ...actionsLoading })(LoginScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.COLORS.GREEN_PORTAL,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 44,
    borderWidth: 1,
    borderColor: theme.COLORS.WHITE,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.WHITE,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    fontSize: 16,
    borderRadius: 6,
    height: 44,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.COLORS.WHITE,
    marginBottom: 10,
    color: theme.COLORS.WHITE
  },
});