import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import Theme from '../constants/Theme';
import { PieChart } from "react-native-chart-kit";


const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
};

const Stack = createStackNavigator();

const StatisticalComponent = (props) => {
    const isFocused = useIsFocused();
    const [dataChart, setDataChart] = useState([]);

    useEffect(() => {
        if (isFocused) {
            getDataChart();
        };

    }, [props, isFocused]);

    var getDataChart = async ()=>{
        let newDataChart = [
                    {
                        name: "Thay linh kiện",
                        population: 3,
                        color: "#FF8000",
                        legendFontColor: "#595959",
                        legendFontSize: 15
                    },
                    {
                        name: "Chỉnh sửa",
                        population: 4,
                        color: "#386ADE",
                        legendFontColor: "#595959",
                        legendFontSize: 15
                    },
                    {
                        name: "Sửa & Thay",
                        population: 5,
                        color: "#2B80B9",
                        legendFontColor: "#595959",
                        legendFontSize: 15
                    },
                    {
                        name: "Khác",
                        population: 6,
                        color: "#00CC99",
                        legendFontColor: "#595959",
                        legendFontSize: 15
                    },
                    {
                        name: "đang xử lý",
                        population: 7,
                        color: "#008080",
                        legendFontColor: "#595959",
                        legendFontSize: 15
                    }
                ];
        setDataChart(newDataChart);
        
    }

    return (
        <View style={styles.container}>
            <View style={{marginTop: 10}}>
                <Text style={{backgroundColor: '#00d300', width: 100, color: 'white', fontWeight:'bold', fontSize:16, paddingLeft: 20, borderRadius:5, marginLeft: 10}}>SL tồn: 0</Text>
                <Text style={{backgroundColor: '#00d300',marginTop: 10, width: 100, color: 'white', fontWeight:'bold', fontSize:16, paddingLeft: 20, borderRadius:5, marginLeft: 10}}>GT tồn: 0</Text>
            </View>
            <View style={{flexDirection: 'row', marginTop: 20}}>
                <View style={{flex: 6, alignItems: 'center'}}>
                    <Text style={{fontSize: 20}}>Biểu đồ xử lý ca bảo hành</Text>
                </View>
                <View style={{flex: 1}}>
                    <Ionicons name="ios-menu" size={24} color="black" />
                </View>
            </View>
            <View style={{marginTop: 20}}> 
                <PieChart
                data={dataChart}
                width={300}
                height={180}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
                />
            </View>
            <View style={{marginTop: 20, alignItems: 'center'}}>
                <Text style={{fontSize: 20}}>Thống kê làm việc 30 ngày qua</Text>
            </View>
            
        </View>
    )
}

const Statistical = (props) => {
    return (
        <Stack.Navigator initialRouteName="StatisticalComponent">
            <Stack.Screen
        name="StatisticalComponent"
        component={StatisticalComponent}
        options={{
          title: "Thống kê",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginHorizontal: 10 }}
              onPress={() => props.navigation.navigate("HomeTab")}
            >
              <Ionicons
                name="ios-menu"
                size={30}
                color="white"
                onPress={() => props.navigation.openDrawer()}
              />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: Theme.COLORS.GREEN_PORTAL,
          },
          headerTitleAlign: "center",
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },

})

export default Statistical;