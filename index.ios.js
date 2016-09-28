/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {AppRegistry,StyleSheet,Text,View} from 'react-native';
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc';

class NativeRTC extends React.Component {
  state={videoURL:null};
  componentDidMount() {
    getUserMedia({
      'audio':true,
      'video':{
        optional:[{sourceId:'com.apple.avfoundation.avcapturedevice.built-in_video:1'}]
      }
    }, stream => {
      this.setState({videoURL:stream.toURL()});
    }, error => {
      console.log('error',error);
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <RTCView streamURL={this.state.videoURL} style={styles.selfView}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#F5FCFF'
  },
  welcome:{
    fontSize:20,
    textAlign:'center',
    margin:10
  },
  selfView:{
    width:200,
    height:250,
    borderWidth:1
  }
});

AppRegistry.registerComponent('NativeRTC', () => NativeRTC);
