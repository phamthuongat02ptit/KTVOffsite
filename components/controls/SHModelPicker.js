import { theme } from 'galio-framework';
import React, { memo} from 'react';
import { TouchableOpacity, View, Text  } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SHModelPicker = (props) => (
  <TouchableOpacity onPress={props.onPress}>
    <View style={{ flexDirection: "row", marginTop: 3, borderRadius: 5, backgroundColor: "#E4E4E4", paddingLeft: 5, paddingTop: 5, paddingBottom: 5}}>
      <View style={{ flex: 1, alignItems: 'center', flexDirection: "row" }}>
        <View>
          <Text style={{fontSize: 12}}>{props.strDate}</Text>
        </View>
      </View>
      <View style={{ justifyContent: 'center', marginRight: 5 }}>
        <MaterialIcons name="date-range" size={20} />
      </View>
    </View>
  </TouchableOpacity>
);

export default memo(SHModelPicker);
