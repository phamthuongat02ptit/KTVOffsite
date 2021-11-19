import React from 'react';
import { StyleSheet } from 'react-native';
import { MultiselectDropdown } from 'sharingan-rn-modal-dropdown';
import Theme from '../../constants/Theme';

const SHMultiselectDropdown = (props) => (
  <MultiselectDropdown
    data={props.data}
    enableSearch={true}
    chipType={props.chipType}
    value={props.value}
    onChange={props.onChange}
    itemContainerStyle={styles.itemContainerStyle}
    itemTextStyle={styles.itemTextStyle}
    textInputStyle={styles.textInputStyle}
    placeHolderTextStyle={styles.placeHolderTextStyle}
    underlineColor="rgba(156, 39, 176, 0)"
    dropdownIcon={require('../../assets/iconDropdown.png')}
    dropdownIconSize={10}
  />
);

const styles = StyleSheet.create({ 
  itemContainerStyle: {
  },
  itemTextStyle:{
  },
  textInputStyle: {
    borderRadius: 5,
    marginLeft: 1,
    height: 35,
    color: Theme.COLORS.DEFAULTTEXT,
    fontSize: 12
  },
  placeHolderTextStyle: {
    color: "#D3D3D3",
    textAlign: "left",
    width: "99%",
    flexDirection: "row"
  },
});

export {SHMultiselectDropdown};
