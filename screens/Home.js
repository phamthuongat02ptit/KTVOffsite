import React,{useEffect} from 'react';
import { StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Block, theme } from 'galio-framework';
import * as Updates from "expo-updates";
import { useIsFocused } from '@react-navigation/native';
import { connect } from "react-redux";

import { Loader } from '../components';
import * as actionsLogin from "../Redux/Action/login";
import * as actionsLoading from "../Redux/Action/loading";

const { width } = Dimensions.get('screen');


const mapStateToProps = (state) => {
  return { ...state };
};


const Home = ({ navigation, route, ...props }) => {
  const ReloadApp = async () => {
    try {
      props.ToggleLoading(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Alert.alert(
          "Đã có phiên bản cập nhật mới",
          "Bạn có đồng ý cập nhật phiên bản mới không?",
          [
            {
              text: "Không",
              onPress: async () => console.log("Cancel Pressed"),
              style: "cancel"
            },
            {
              text: "OK", onPress: async () => {
                props.ToggleLoading(true);
                await Updates.fetchUpdateAsync();
                props.ToggleLoading(false);
                await Updates.reloadAsync();
              }
            }
          ]
        );
        props.ToggleLoading(false);
      }
    } catch (e) {
      props.ToggleLoading(false);
      // handle or log error
    }
  };

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      const callAsync = async () => {
        await ReloadApp();
      };
      callAsync();
    }
  }, [isFocused]);

  const renderArticles = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articles}>
        {/* <Loader loading={props.loading}></Loader> */}
        <Block flex>
         
        </Block>
      </ScrollView>
    )
  }
  return (
    <Block flex center style={styles.home}>
      {renderArticles()}
    </Block>
  );
}

const styles = StyleSheet.create({
  home: {
    width: width,
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
});


export default connect(mapStateToProps, { ...actionsLogin, ...actionsLoading })(Home);

