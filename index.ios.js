'use strict';

import React from 'react';
import {AppRegistry,StyleSheet,Text,View,TouchableHighlight} from 'react-native';
import WebRTC from 'react-native-webrtc';
import genId from './utils.js';

// const signalingServer = 'wss://localhost:8080';
// 'video':{optional:[{sourceId:'com.apple.avfoundation.avcapturedevice.built-in_video:1'}]}
const signalingServer = 'wss://webrtc-simple.herokuapp.com';
const serverConnection = new WebSocket(signalingServer);
const peerConnectionConfig = {'iceServers':[{'url':'stun:stun.l.google.com:19302'}]};
let componentInstance;
let peerConnection;
let uuid;
let localStream;

function componentReady () {
  uuid = genId();
  serverConnection = new WebSocket(signalingServer);
  serverConnection.onmessage = gotMessageFromServer;
  var constraints = {audio:true,video:
    // false
    {optional:[{sourceId:'com.apple.avfoundation.avcapturedevice.built-in_video:1'}]}
  };
  WebRTC.getUserMedia(constraints, stream => {
    localStream = stream;
    componentInstance.setState({localVideoUrl:stream.toURL()});
  }, error => errorHandler('error',error));
}

function start(isCaller) {
  console.log('start:isCaller',isCaller);
  peerConnection = new WebRTC.RTCPeerConnection(peerConnectionConfig);
  peerConnection.addEventListener('icecandidate',gotIceCandidate);
  peerConnection.addEventListener('addstream',gotRemoteStream);
  peerConnection.addStream(localStream);
  if(isCaller) {
    peerConnection.createOffer(gotDescription,errorHandler);
  }
  console.log('start:peerConnection',peerConnection);
}

function gotDescription(description) {
  peerConnection.setLocalDescription(
    description,
    () => serverConnection.send(JSON.stringify({'sdp':peerConnection.localDescription,'uuid':uuid})),
    errorHandler
  );
}

function gotIceCandidate(event) {
  if(event.candidate !== null) {
    serverConnection.send(JSON.stringify({'ice':event.candidate,'uuid':uuid}));
  }
}

function gotRemoteStream(event) {
  console.log('gotRemoteStream');
  componentInstance.setState({remoteVideoUrl:event.stream.toURL()});
}

function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  if(signal.uuid === uuid) return;
  console.log('gotMessageFromServer:signal',signal);
  if(peerConnection === undefined) start(false);
  if(signal.sdp) {
    peerConnection.setRemoteDescription(
      new WebRTC.RTCSessionDescription(signal.sdp),
      function() {
        if(signal.sdp.type === 'offer') {
          peerConnection.createAnswer(createdDescription,errorHandler);
        }
      },
      errorHandler
    );
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new WebRTC.RTCIceCandidate(signal.ice),errorHandler);
  }
}

function createdDescription(description) {
  console.log('createdDescription',description);
  peerConnection.setLocalDescription(description,function() {
    serverConnection.send(JSON.stringify({'sdp':peerConnection.localDescription,'uuid':uuid}));
  },errorHandler);
}

function errorHandler(error) {
  console.log(error);
}

class NativeRTC extends React.Component {
  state={localVideoUrl:null,remoteVideoUrl:null}
  componentDidMount() {
    componentInstance = this;
    componentReady();
  }
  render() {
    return (
      <View style={styles.container}>
        <WebRTC.RTCView streamURL={this.state.localVideoUrl} style={styles.selfView}/>
        <TouchableHighlight onPress={start.bind(this,true)}>
          <Text>Start</Text>
        </TouchableHighlight>
        {
          this.state.remoteVideoUrl
          ? <WebRTC.RTCView streamURL={this.state.remoteVideoUrl} style={styles.selfView}/>
          : null
        }
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
  selfView:{
    margin:15,
    width:250,
    height:250,
    borderWidth:1
  }
});

AppRegistry.registerComponent('NativeRTC', () => NativeRTC);
