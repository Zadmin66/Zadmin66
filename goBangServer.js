var ws = require("nodejs-websocket");
var users = [];
var onlineCount = 0;

var chessBoard = [];
var next = 2;// 下一步走棋的人
var lastStep = {}; // 上一步

var IP = "10.100.106.114";
var port = 9000;


var server = ws.createServer(function(connection){
    
    var user;
    
    console.log("有新用户接入");
    onlineCount = server.connections.length;
    
    
    connection.on("text",function(str){
        console.log("接收到消息",str);
        var data = JSON.parse(str);
        if(data.type == "chess"){ // 走一步棋子
            chessBoard = data.data;
            next = data.next;
            lastStep = data.lastStep;
            broadCastChessBoard(data.roomId);
        }else if(data.type == "regret"){ // 悔棋
            
        }else if(data.type == "giveUp"){ // 认输
            
        }else if(data.type == "again"){ // 再来一局
            if(data.data.eventOrigin == "player1"){
                var msg = {};
                msg.type = "again";
                server.connections.forEach(function(conn,index) {
                    connection.sendText(JSON.stringify(msg));
                })
            }else if(data.data.eventOrigin == "player2"){
                var msg = {};
                msg.type = "again";
                server.connections.forEach(function(conn,index) {
                    connection.sendText(JSON.stringify(msg));
                })
            }else{
                // continue;
            }
        }else if(data.type == "user"){ // 新用户接入
            user = data.data;
            user.sessionId = connection.headers['sec-websocket-key'];
            if(users.containUserName(user.name)){
                var index = users.userIndex(user.name);
                users[index] = user;
            }else{
                users.push(user);
            }
            //broadCastChessBoard();
        }else{ // 未知类型
            
            server.connections.forEach(function(conn,index) {
                // console.log(connection.headers['sec-websocket-key']);
                // console.log(server.connections[index].headers['sec-websocket-key'])
               // connection.sendText(JSON.stringify(server.connections[index]));
            })
        }
    });
    
    connection.on("error",function(err){
        console.log('遇到错误，详情：');
        console.log(err);
    });
    
    connection.on("close",function(code,reason){
        console.log("code closed", code);
        console.log("reason closed", reason);
        users.removeUser(user);
    });
    
}).listen(port);


Array.prototype.removeUser = function(user){
    for(let i=0;i<this.length;i++){
        //console.log(JSON.stringify(this[i]), JSON.stringify(user));
        if(JSON.stringify(this[i]) == JSON.stringify(user)){
            this.splice(i,1);
        }
    }
}

Array.prototype.containUserName = function(str) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].name == str) {
            return true;
        }
    }
    return false;
}

Array.prototype.userIndex = function(str) {
    var index = -1;
    for (var i = 0; i < this.length; i++) {
        if (this[i].name == str) {
            index = i;
        }
    }
    return index;
}

function broadCastChessBoard(roomId){
    console.log("在线人数:"+server.connections.length);
    
    var msg = {};
    msg.type = "chessBoard";
    msg.data = chessBoard;
    msg.next = next;
    msg.lastStep = lastStep;
    console.log(users)
    users.forEach((user,index)=>{
        if(user.roomId == roomId){ //sessionId
            server.connections.forEach(function(connection,index) {
                if(server.connections[index].headers['sec-websocket-key'] == user.sessionId){
                    connection.sendText(JSON.stringify(msg));
                }
            })
        }
    })
    
}
//console.log(server);
console.log("服务已搭建好,静候佳音；链接地址：ws://"+IP+":"+port);