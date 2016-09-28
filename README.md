## API

```js
// MediaStreamTrack.getSources(function(sources));
[{
  id:'com.apple.avfoundation.avcapturedevice.built-in_video:0',
  facing:'back',
  label:'Back Camera',
  kind:'video'
},{
  id:'com.apple.avfoundation.avcapturedevice.built-in_video:1',
  facing:'front',
  label:'Front Camera',
  kind:'video'
},{
  id:'com.apple.avfoundation.avcapturedevice.built-in_audio:0',
  facing:'',
  label:'iPhone Microphone',
  kind:'audio'
}]

// getUserMedia({
//   'audio':true,
//   'video':{
//     optional:[{sourceId:'com.apple.avfoundation.avcapturedevice.built-in_video:1'}]
//   }
// }, function(stream){}, function(error){});
{
  active:true,
  id:'C3C0C860-4C35-4494-A921-D79E36F36F7E'
  _tracks:[{
    _enabled: true,
    id:'FBA640B0-3AED-4754-8ABE-698B375B01AE',
    kind:'audio',
    label:'FBA640B0-3AED-4754-8ABE-698B375B01AE',
    muted:false,
    readonly:true,
    remote:false,
    readyState:'live'
   },{
    _enabled:true,
    id:'E78C5EAE-F5B2-4D2D-91E5-74F0D2FB417D',
    kind:'video',
    label:'E78C5EAE-F5B2-4D2D-91E5-74F0D2FB417D',
    muted:false,
    readonly:true,
    remote:false,
    readyState:'live'
  }]
}
```

## Error

```
2016-09-28 14:27:37.709 [info][tid:main][RCTBatchedBridge.m:74] Initializing <RCTBatchedBridge: 0x17d8a4a0> (parent: <RCTBridge: 0x17e7dae0>, executor: RCTJSCExecutor)
2016-09-28 14:27:37.714 NativeRTC[308:49241] *** Assertion failure in -[RCTBatchedBridge loadSource:](), /Users/besartshyti/Projects/NativeRTC/node_modules/react-native/React/Base/RCTBatchedBridge.m:191
2016-09-28 14:27:37.716 NativeRTC[308:49241] *** Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: 'bundleURL must be non-nil when not implementing loadSourceForBridge'
*** First throw call stack:
(0x2a22ff8f 0x388e0c8b 0x2a22fe65 0x2af34f73 0xc6c75 0xc5761 0xc54c5 0xfac57 0xfab57 0xf9edd 0xf9d4d 0x77259 0x561f3 0x2d91d0b3 0x2db13929 0x2db15fe9 0x2db20c69 0x2db1478b 0x30e16ec9 0x2a1f5db5 0x2a1f5079 0x2a1f3bb3 0x2a13ff31 0x2a13fd43 0x2d916c87 0x2d911879 0x56597 0x38e92aaf)
libc++abi.dylib: terminating with uncaught exception of type NSException
(lldb)
```
