var ws = require("nodejs-websocket");
//console.log(ws);
var users = [];
var onlineCount = 0;
var roomCount = 30;
var ip = "10.100.106.114";
var port = 9009;

var server = ws.createServer(function(connection){
    var user;
    
    console.log("有新用户接入");
    onlineCount++;
    
    connection.on("text",function(str){
        console.log("接收到消息",str);
        //connection.sendText("把你的消息再还给你——"+str);
        var data = JSON.parse(str);
        if(data.type == "user"){
            user = data.data;
            // server.connections.user = user;
            if(users.containUserName(user.name)){
                var index = users.userIndex(user.name);
                users[index] = user;
            }else{
                users.push(user);
            }
            
            //broadCastUsers(connection,JSON.stringify(users));
            broadCastUsers();
        }
    });
    
    connection.on("error",function(err){
        console.log('handle err');
        console.log(err);
    });
    
    connection.on("close",function(code,reason){
        console.log("code closed", code);
        console.log("reason closed", reason);
        users.removeUser(user);
    });
    
    var msg = {};
    msg.type = "baseMsg";
    msg.data = {"roomCount":roomCount};
    connection.send(JSON.stringify(msg));
    //connection.send("服务器已和你建立链接");
    
}).listen(port);

function broadCast(connection,roomId,str){
    for(let i=0;i<connection.lenth;i++){
        if(connection[i].user.roomId == roomId){
            connection[i].senText("广播消息——"+str);
        }
    }
}

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

function broadCastUsers(){
    console.log(server.connections.length);
    var msg = {};
    msg.type = "usersMsg";
    msg.data = users;
    server.connections.forEach(function(connection,index) {
        //console.log(index);
        connection.sendText(JSON.stringify(msg));
    })
}
//console.log(server);
console.log("服务已搭建好,静候佳音；链接地址：ws://"+ip+":"+port);