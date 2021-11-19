import React from "react";
import { StyleSheet, Text, View, Alert, TextInput} from "react-native";

const SearchOderPartsRequestReturnDetails = () => {
    return (
    <View style={{padding: 10}}>
        <Text style={{fontSize: 17, marginTop: 10}}>Tìm kiếm</Text>
        <View style={{ marginTop: 10}}>
            <TextInput
            style={{backgroundColor: 'white', height: 40, borderBottomWidth: 1, fontSize: 19, paddingLeft: 10}}
            placeholder="Tìm kiếm ..."
            />
        </View>
    </View>
  );
}
export default SearchOderPartsRequestReturnDetails;