import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import RNPicker  from "rn-modal-picker";

const SHRNPicker = (props) => (
  <RNPicker
    dataSource={props.dataSource}
    dummyDataSource={props.dummyDataSource}
    defaultValue={props.defaultValue}
    pickerTitle={props.pickerTitle}
    showSearchBar={true}
    disablePicker={false}
    changeAnimation={"none"}
    searchBarPlaceHolder={"Tìm kiếm....."}
    showPickerTitle={true}
    searchBarContainerStyle={styles.searchBarContainerStyle}
    pickerStyle={styles.pickerStyle}
    itemSeparatorStyle={styles.itemSeparatorStyle}
    pickerItemTextStyle={styles.listTextViewStyle}
    selectedLabel={props.selectedLabel}
    placeHolderLabel={props.placeHolderLabel}
    selectLabelTextStyle={styles.selectLabelTextStyle}
    placeHolderTextStyle={styles.placeHolderTextStyle}
    selectedValue={props.selectedValue}
    searchable = {true}
    onSearch={text => {
      // Example
      if (this._API.isFetching())
          this._API.abort();
  
      this._API = this.fetchFromServer(text, (items) => {
          // See controller: https://github.com/hossein-zare/react-native-dropdown-picker#controller
          this.controller.resetItems(items); // Maybe a new method will be introduced for a better UX!
      });
  }}
  />
);

const styles = StyleSheet.create({
  //model picker
  itemSeparatorStyle: {
    height: 1,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#D3D3D3"
  },
  searchBarContainerStyle: {
    marginBottom: 10,
    flexDirection: "row",
    height: 40,
    shadowOpacity: 1.0,
    shadowRadius: 5,
    shadowOffset: {
      width: 1,
      height: 1
    },
    backgroundColor: "rgba(255,255,255,1)",
    shadowColor: "#d3d3d3",
    borderRadius: 10,
    elevation: 3,
    marginLeft: 10,
    marginRight: 10
  },
  selectLabelTextStyle: {
    color: "#000",
    textAlign: "left",
    width: "99%",
    padding: 7,
    flexDirection: "row",
    fontSize: 12
  },
  placeHolderTextStyle: {
    color: "#D3D3D3",
    padding: 10,
    textAlign: "left",
    width: "99%",
    flexDirection: "row"
  },
  dropDownImageStyle: {
    marginLeft: 10,
    width: 10,
    height: 10,
    alignSelf: "center"
  },
  listTextViewStyle: {
    color: "#000",
    marginVertical: 10,
    flex: 0.9,
    marginLeft: 20,
    marginHorizontal: 10,
    textAlign: "left"
  },
  pickerStyle: {
    width: "96.5%",
    marginLeft: 5,
    paddingRight: 35,
    backgroundColor: "#E4E4E4",
    borderRadius: 5,
    flexDirection: "row",
    marginTop: 2
  }
});

export default memo(SHRNPicker);
