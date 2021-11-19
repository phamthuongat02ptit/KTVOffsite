import React, { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Images } from '../../constants';


const Logo = () => (
  <Image source={Images.loginshgportal} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    marginBottom: 20,
    alignSelf:'center'
  },
});

export default memo(Logo);
