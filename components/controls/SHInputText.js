import { theme } from 'galio-framework';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';


const SHInputText = (props) => {
  return (
    <TextInput
      maxLength={500}
      name={props.name}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      style={styles.input}
      placeholderTextColor={theme.COLORS.SECONDARY}
    />
  )
}
const styles = StyleSheet.create({
  input: {
    width: '100%',
    fontSize: 12,
    borderRadius: 6,
    borderBottomWidth: 1,
    backgroundColor: theme.COLORS.WHITE
  },
});

export default memo(SHInputText);
