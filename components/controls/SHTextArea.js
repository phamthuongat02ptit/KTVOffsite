import { theme } from 'galio-framework';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Textarea from 'react-native-textarea';


const SHTextArea = (props) => {
  return (
    <Textarea
      placeholder={props.placeholder}
      value={props.value}
      style={styles.input}
      value={props.value}
      name={props.name}
      onChangeText={props.onChangeText}
      containerStyle={styles.containerStyle}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    minHeight: 100,
    width: '100%',
    fontSize: 16,
    borderRadius: 6,
    height: 44,
    padding: 10,
    marginBottom: 10,
    backgroundColor: theme.COLORS.WHITE
  },
  containerStyle: {
    height: 100,
    borderBottomColor: theme.COLORS.SECONDARY,
    backgroundColor: theme.COLORS.WHITE
  }
});

export default memo(SHTextArea);
