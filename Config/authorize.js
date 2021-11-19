import { AUTHORIZATION } from "@env"
const headers = {
    Authorization: AUTHORIZATION,
};

const GetConfigLogin = (username,password,appid) => {
    return {
        params: {
            appid: appid,
            username,
            password,
            deviceinfo: "",
        },
        headers
    };
}
export default {
    GetConfigLogin:(username,password,appid)=>{
        return GetConfigLogin(username,password,appid)
    },
    headers
}