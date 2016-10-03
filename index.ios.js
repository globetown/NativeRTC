'use strict';

import React from 'react';
import {AppRegistry,StyleSheet,Text,View,TouchableHighlight} from 'react-native';
import WebRTC from 'react-native-webrtc';
import genId from './utils.js';

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
  var constraints = {audio:true,video:{optional:[{sourceId:'com.apple.avfoundation.avcapturedevice.built-in_video:1'}]}};
  WebRTC.getUserMedia(constraints, stream => {
    localStream = stream;
    componentInstance.setState({localVideoUrl:stream.toURL()});
  },console.log);
}

function start(isCaller) {
  peerConnection = new WebRTC.RTCPeerConnection(peerConnectionConfig);
  peerConnection.addEventListener('icecandidate',gotIceCandidate);
  peerConnection.addEventListener('addstream',gotRemoteStream);
  peerConnection.addStream(localStream);
  if(isCaller) {
    peerConnection.createOffer(gotDescription,console.log);
  }
}

function gotDescription(description) {
  peerConnection.setLocalDescription(description,success,console.log);
  function success () {
    serverConnection.send(JSON.stringify({
      'sdp':peerConnection.localDescription,
      'uuid':uuid
    }));
  }
}

function gotIceCandidate(event) {
  if(event.candidate !== null) {
    serverConnection.send(JSON.stringify({
      'ice':event.candidate,
      'uuid':uuid
    }));
  }
}

function gotRemoteStream(event) {
  componentInstance.setState({remoteVideoUrl:event.stream.toURL()});
}

function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  if(signal.uuid === uuid) return;
  if(peerConnection === undefined) start(false);
  if(signal.sdp) {
    peerConnection.setRemoteDescription(new WebRTC.RTCSessionDescription(signal.sdp),success,console.log);
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new WebRTC.RTCIceCandidate(signal.ice),console.log);
  }
  function success () {
    if(signal.sdp.type === 'offer') {
      peerConnection.createAnswer(createdDescription,console.log);
    }
  }
}

function createdDescription(description) {
  peerConnection.setLocalDescription(description,function() {
    serverConnection.send(JSON.stringify({
      'sdp':peerConnection.localDescription,
      'uuid':uuid
    }));
  },console.log);
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
