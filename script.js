'use strict';

const fs = require('fs');
const exec = require('child_process').execSync;

const WEBRTC_BIN_PATH = `${__dirname}/node_modules/react-native-webrtc/ios/WebRTC.framework`;
const ARCH_TYPES = ['i386','x86_64','armv7','arm64'];

if(process.argv[2] === '-extract'){
  console.log(`Extracting...`);
  ARCH_TYPES.forEach(elm => {
    exec([
      `lipo -extract`,
      `${elm} WebRTC`,
      `-o WebRTC-${elm}`
    ].join(' '),{cwd:WEBRTC_BIN_PATH})
  });

  console.log(exec('ls -ahl | grep WebRTC-',{cwd:WEBRTC_BIN_PATH}).toString());
  console.log('Done!');
}

if(process.argv[2] === '-simulator'){

}
