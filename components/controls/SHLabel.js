import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from "galio-framework";


const SHLabel = (props) => (
  <Text style={styles.label}>{props.labelname}</Text>
);

const styles = StyleSheet.create({
  label: {
    color: '#8e8e8f',
  },
});

export default memo(SHLabel);
