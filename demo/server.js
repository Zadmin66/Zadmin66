const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });


server.on('open', function open() {
  console.log('connected');
});

server.on('close', function close() {
  console.log('disconnected');
});

server.on('connection', function connection(ws) {
  let clientName = 'GUEST';

  ws.on('message', function incoming(message) {
    message = JSON.parse(message);
    // 推送訊息給其餘連線端
    switch (message.type) {
      case '0':
        server.clients.forEach(function each(client) {
          if (client !== ws &&client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({user: 'system', msg: `${message.name} 進入聊天室`}));
          }
        });
        clientName = message.name;
        break;
      case '1':
        server.clients.forEach(function each(client) {
          if (client !== ws &&client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({user: 'other', msg: message.msg, sender: clientName}));
          }
        });
        break;
      case '2':
        server.clients.forEach(function each(client) {
          if (client !== ws &&client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({user: 'system', msg: `${clientName} 已更換暱稱為 ${message.name}`}));
          }
        });
        ws.send(JSON.stringify({user: 'system', msg: `您已更換暱稱為 ${message.name}`}));
        clientName = message.name;
        break
      default:
        break;
    }
    

  });

});
console.log(server)


