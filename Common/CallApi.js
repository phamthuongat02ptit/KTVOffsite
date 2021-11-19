import axios from 'axios';
import { APIURL, AUTHORIZATION, APILOCAL } from "@env"

//Lấy dữ liệu
//THUONGPV 20210801
let GetApis = async (controller, action, params, timeout) => {
    try {
        let res = await axios.get(`${APIURL}/${controller}/${action}`, {
            baseURL: `${APIURL}/`,
            timeout: timeout,
            headers: {
                'cache-control': 'no-cache',
                'Authorization': AUTHORIZATION,
                'Access-Control-Allow-Origin': '*',
            },
            params: params
        });
        let data = await res.data;
        if (data == undefined) {
            return "error get";
        }
        else
            return data;
    } catch (error) {
        return error
    }
};

let PostApis = async (controller, action, params, bodys, timeout) => {
    try {
        let res = await axios({
            url: `${APIURL}/${controller}/${action}`,
            method: 'POST',
            timeout: timeout,
            headers: {
                'Content-Type': 'application/json',
                'cache-control': 'no-cache',
                'Authorization': AUTHORIZATION,
                'Access-Control-Allow-Origin': '*',
            },
            //params: params,
            data: JSON.stringify(params)
        });
        let data = await res.data;
        if (data == undefined) {
            return "error get";
        }
        else
            return data;
    } catch (error) {
        return error
    }
};

export { GetApis, PostApis };