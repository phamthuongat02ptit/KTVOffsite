import { ACTION_NAME } from "../Constants/login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { showMessage } from "react-native-flash-message";
import AUTHORIZE from '../../Config/authorize'
import { APIURL, APPLICATIONID, APPWDMID } from "@env"

export function SetInfoLogin(userLogin) {
    return {
        type: ACTION_NAME.SetInfoLogin,
        payload: { ...userLogin },
    };
};

export const GetInfoLogin = () => {
    //IN order to use await your callback must be asynchronous using async keyword.
    return async (dispatch) => {
        try {
            const userLogin = await AsyncStorage.getItem('userLogin');
            dispatch(SetInfoLogin(JSON.parse(userLogin)));
        } catch (error) {
            Alert.alert('Lỗi', error);
        }
    };
};

export const LoginApp = (userName, password, role) => {
    //IN order to use await your callback must be asynchronous using async keyword.
    return async (dispatch) => {
        try {
            let applicationId = APPLICATIONID,
                controler = 'Account';
            //THUONGPV 2021/09/04 case cho vai trò đăng nhập: trạm, kỹ thuật viên
            if (role == 'wdm') {
                applicationId = APPWDMID;
                controler = 'KTV';
            }
            const result = await axios.get(`${APIURL}/${controler}/Login`, { ...AUTHORIZE.GetConfigLogin(userName, password, `${applicationId}`) });
            if (result.data.UserName) {
                await AsyncStorage.setItem( "userLogin", JSON.stringify({ ...result.data }) );
                let Roles = 'ktvSH';
                if(result.data.Role != null && result.data.Role != ''){
                    await AsyncStorage.setItem( "Role", result.data.Role );
                }else{
                    await AsyncStorage.setItem( "Role", Roles );
                }
            } else {
                showMessage({ message: result.data.messenger, type: "warning", position: 'top' });
            }
        } catch (error) { Alert.alert('Lỗi', error) }
    };
};