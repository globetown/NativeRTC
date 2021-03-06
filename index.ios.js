'use strict';

import React from 'react';
import {AppRegistry,StyleSheet,Text,View,TouchableHighlight} from 'react-native';
import WebRTC from 'react-native-webrtc';
import genId from './utils.js';
import Icon from 'react-native-vector-icons/FontAwesome';

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

function close() {
  peerConnection.close();
  componentInstance.setState({remoteVideoUrl:null});
  cforceUpdate
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
        <WebRTC.RTCView streamURL={this.state.remoteVideoUrl} style={styles.bigVideo} objectFit={'cover'}>
          { this.state.remoteVideoUrl
            ? <WebRTC.RTCView streamURL={this.state.localVideoUrl} style={styles.smallVideo} objectFit={'cover'}/>
            : <View/>
          }
          <TouchableHighlight onPress={this.state.remoteVideoUrl ? close : start.bind(this,true)} style={[styles.callButton, this.state.remoteVideoUrl && {backgroundColor:'red'}]}>
            <Icon name='phone' size={40} color='white' style={this.state.remoteVideoUrl && {transform: [{rotate: '135deg'}]}}/>
          </TouchableHighlight>
        </WebRTC.RTCView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#F5FCFF'
  },
  bigVideo:{
    flex:1,
    alignItems:'center',
    justifyContent:'space-between',
    borderWidth:1
  },
  smallVideo:{
    height:133,
    width:75,
    alignSelf:'flex-end'
  },
  callButton:{
    height:80,
    width:80,
    borderRadius:40,
    margin:40,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green',
  }
});

AppRegistry.registerComponent('NativeRTC', () => NativeRTC);
