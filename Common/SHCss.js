import { StyleSheet } from 'react-native';

const SHCss = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#218838',
        width: 100,
        height: 30,
        position: 'relative',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 5,
      },
      buttonText:{
        position: 'absolute',
        top: '4%',
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      },
      container: {
        flex: 1,
        flexDirection: "column",
      },
      viewPanel: {
        borderRadius: 5,
        margin: 5,
        marginBottom: 0,
        opacity: 1
      },
      image: {
        flex: 1,
        flexDirection: 'column',
        resizeMode: "cover",
      },
      titlepanel: {
        paddingLeft: 4,
        fontWeight: 'bold'
      },
      textInput: {
        fontSize: 16,
        height: 44,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: 'white'
    },
})

export {SHCss};