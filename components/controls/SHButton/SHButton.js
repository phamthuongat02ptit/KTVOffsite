import { theme } from 'galio-framework';
import React, { memo } from 'react';
import Theme from '../../../constants/Theme';
import { StyleSheet, Button, View, TouchableOpacity, Text } from 'react-native';


const SHButton = (props) => {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={styles.view} backgroundColor={props.backgroundColor}>
                <Text style={styles.text}>{props.titles}</Text>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    view: {
        alignItems: 'center',
        paddingTop: 7,
        paddingLeft: 20,
        paddingBottom: 7,
        paddingRight: 20,
        justifyContent: 'center',
        borderRadius: 5
    },
    text: {
        color: 'white',
        fontWeight: 'bold'
    },
});

export default memo(SHButton);
