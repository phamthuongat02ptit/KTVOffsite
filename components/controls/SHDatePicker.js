import { theme } from 'galio-framework';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import DatePicker from 'react-native-datepicker';

const SHDatePicker = (props) => (
  <DatePicker
    selectedValue={props.selectedValue}
    onDateChange={props.onDateChange}
    onChange={props.onChange}
    date={props.date}
    style={styles.picker}
    mode="date"
    placeholder="Select date"
    format="DD-MM-YYYY"
    minDate="01-01-2000"
    maxDate="01-01-2030"
    confirmBtnText="Đồng ý"
    cancelBtnText="Hủy bỏ"
    customStyles={{
      dateIcon: {
        position: 'absolute',
        right: 0,
        top: 4,
        marginLeft: 0
      },
      dateInput: {
        borderWidth: 0,
      },
      datePicker: {
        backgroundColor: '#d1d3d8',
        justifyContent: 'center'
      }
    }}
  />
);

const styles = StyleSheet.create({
  picker: {
    width: '100%',
    borderWidth: 0,
    textAlign: 'left',
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.SECONDARY,
    color: theme.COLORS.SECONDARY,
    backgroundColor: theme.COLORS.WHITE
  },
});

export default memo(SHDatePicker);
