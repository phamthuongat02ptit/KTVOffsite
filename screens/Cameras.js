import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import {
  Ionicons,
  FontAwesome5,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const Cameras = (props) => {
  const camRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedPhoto, setcapturedPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [images, setimages] = useState(props.dataDetail);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  async function takePicture() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      let storedObject = {};
        storedObject.uriImage = data.uri;
        storedObject.widthImage = data.width;
        storedObject.heightImage = data.height;
      //console.log(data);
        await AsyncStorage.setItem('infoImage', JSON.stringify(storedObject));
        
      setcapturedPhoto(data.uri);
      setOpen(true);
      //console.log(data);
    }
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={camRef}>
        {/* View này để chèn view dưới xuống */}
        <View flex={9}></View>
        <View style={styles.buttonContainer}>
          <View style={{ flex: 1, paddingLeft: 10, justifyContent: "center" }}>
            <View style={{ width: "60%", height: "80%" }}>
              <Image
                style={{ width: "100%", height: "100%" }}
                source={
                  { uri: capturedPhoto }
                    ? { uri: capturedPhoto }
                    : require("../assets/imgs/logosunhouse.png")
                }
              />
            </View>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <TouchableOpacity onPress={() =>{ takePicture()}}>
              <MaterialCommunityIcons
                name="circle-slice-8"
                size={55}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}
            >
              <Text style={styles.text}>
                {" "}
                <Ionicons
                  name="ios-camera-reverse-outline"
                  size={35}
                  color="white"
                />{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
      {/* { capturedPhoto &&
        <Modal
        animationType="slide"
        transparent={false}
        visible={open}
        >
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20}}>
                <TouchableOpacity style={{margin: 10}} onPress={()=> setOpen(false)}>
                    <FontAwesome name="window-close" size={50} color="#ff0000"/>
                </TouchableOpacity>

                <Image style={{width:"100%", height: 300, }} 
                    source={{uri: capturedPhoto}}
                />
            </View>
        </Modal>
      } */}
    </View>
  );
};
export default Cameras;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: "rgba(52, 52, 52, 0.5)",
    flexDirection: "row",
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
    width: 70,
  },
  text: {
    fontSize: 18,
    color: "white",
    marginTop: 10,
  },
});
