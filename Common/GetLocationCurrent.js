import {getDistance} from 'geolib';
import * as Location from "expo-location";
//Lấy tọa độ vị trí hiện tại
//Thuongpv 20210809
let GetLocationCurrent = async() => {
    let location = await Location.getLastKnownPositionAsync({});
    return location.coords;
};
export { GetLocationCurrent };