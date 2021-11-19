//controls này để tính ra khoảng cách giữa 2 tọa độ với tọa độ truyền vào là tọa độ khách hàng
//đến tọa độ ở vị trí hiện tại
import React, { useState, useEffect, memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from "galio-framework";
//lay toa do
import {getDistance} from 'geolib';
import * as Location from "expo-location";



const SHDistance = (props) => {
    //const [address, setAddress] = useState(props.address);
    
    const [distance, setDistance] = useState(0);
    //bỏ đi phần tử trước dấu ',' đầu tiên
    //trong trường hợp địa chỉ không convert ra được tọa độ
    const convertAddress = (addre) => {
        return addre.slice(addre.indexOf(",")+1);
    };

    useEffect(() => {
        (async () => {
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
                Alert.alert('Bạn chưa bật định vị', 'Vui lòng bật định vị để sử dụng chức năng này.', [{ text: 'OK' }], { cancelable: false });
                return;
            }
            let addres = await Location.geocodeAsync(props.address);
            if(!addres[0]){
                addres = await Location.geocodeAsync(convertAddress(props.address));
                if(!addres[0]){
                    addres = await Location.geocodeAsync(convertAddress(convertAddress(props.address)));
                    if(!addres[0]){
                    addres = await Location.geocodeAsync(convertAddress(convertAddress(convertAddress(props.address))));
                }
                }
            }
            let location = await Location.getLastKnownPositionAsync({});
            var distances = await getDistance(
                {latitude: location.coords.latitude, longitude: location.coords.longitude},
                {latitude: addres[0].latitude, longitude: addres[0].longitude},
            );
            setDistance(distances/1000);
        })();
    }, [distance]);


    return(
        <Text>{distance}</Text>
    )
};



export default memo(SHDistance);
