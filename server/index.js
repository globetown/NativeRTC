'use strict';

var fs = require('fs');
var WebSocketServer = require('ws').Server;
var http = require('http');
var serverConfig

if(process.env.PORT === undefined) {
  http = require('https');
  serverConfig = {
    key:fs.readFileSync(`${__dirname}/key.pem`),
    cert:fs.readFileSync(`${__dirname}/cert.pem`)
  };
}

// ----------------------------------------------------------------------------------------
var handleRequest = (request,response) => {
  if(request.url === '/') {
    response.writeHead(200,{'Content-Type':'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  } else if(request.url === '/webrtc.js') {
    response.writeHead(200,{'Content-Type':'application/javascript'});
    response.end(fs.readFileSync('client/webrtc.js'));
  } else if(request.url === '/adapter.js') {
    response.writeHead(200,{'Content-Type':'application/javascript'});
    response.end(fs.readFileSync('client/adapter.js'));
  }
};

var httpServer = http.createServer.apply(
  undefined,
  [serverConfig,handleRequest].filter(elm => elm)
).listen(process.env.PORT || 8080);
// ----------------------------------------------------------------------------------------
var wss = new WebSocketServer({server:httpServer});
wss.on('connection', ws => {
  console.log('connection');
  ws.on('message', message => {
    console.log('message');
    const data = JSON.parse(message);
    wss.broadcast(message);
  });
});

wss.broadcast = data => {
  for(var i in wss.clients) {
    wss.clients[i].send(data);
  }
};
