import 'react-native-gesture-handler';
import React, {useState} from "react";
import { Image } from "react-native";
import AppLoading from "expo-app-loading";
import { useFonts } from '@use-expo/font';
import { Asset } from "expo-asset";
import { Block, GalioProvider } from "galio-framework";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import FlashMessage from "react-native-flash-message";
// Before rendering any navigation stack
import { enableScreens } from "react-native-screens";
enableScreens();

import Screens from "./navigation/Screens";
import { Images, argonTheme } from "./constants";


import configureStore from "./Redux/Store/configureStore";
const store = configureStore();

// cache app images
const assetImages = [
  Images.Logo,
  Images.ArgonLogo,
  Images.iOSLogo,
  Images.androidLogo
];


function cacheImages(images) {
  return images.map(image => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

export default props => {
  const [isLoadingComplete, setLoading] = useState(false);
  let [fontsLoaded] = useFonts({
    'ArgonExtra': require('./assets/font/argon.ttf'),
  });

  function _loadResourcesAsync() {
    return Promise.all([...cacheImages(assetImages)]);
  }

  function _handleLoadingError(error) {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

 function _handleFinishLoading() {
    setLoading(true);
  };

  if(!fontsLoaded && !isLoadingComplete) {
    return (
      <AppLoading
        startAsync={_loadResourcesAsync}
        onError={_handleLoadingError}
        onFinish={_handleFinishLoading}
      />
    );
  } else if(fontsLoaded) {
    return (
      <NavigationContainer>
        <GalioProvider theme={argonTheme}>
          <Block flex>
           <Provider store ={store}>
           <Screens />
           </Provider>
          </Block>
        </GalioProvider>
        <FlashMessage
          floating={true}
          position="bottom"
          duration={5000}
          textStyle={{fontSize:18}}
          titleStyle={{fontSize:18}}
          style={{height:50,padding:15}}
        ></FlashMessage>
      </NavigationContainer>
    );
  } else {
    return null
  }
}

