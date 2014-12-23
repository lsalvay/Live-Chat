var express = require('express'),
	app 	= express();
	

var server  = require('http').createServer(app),
	io		= require('socket.io').listen(server);

var users = {};
var welcomeMesaje = "Bienvenido, puedo ayudarle?";
	
server.listen(3000);

io.sockets.on('connection', function(socket){
    socket.on('new user', function(data, callback){
        if (data in users){
            callback(false);
        } else{
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
        }

        
        if(socket.nickname!="Admin"){
            users[socket.nickname].emit('welcome', welcomeMesaje);
        }
    });

    function updateNicknames(){
        io.sockets.emit('usernames', Object.keys(users));
    }

    socket.on('send message', function(data){
         debugger;
        if(socket.nickname=="Admin"){
            if(!users[data.para]){
                users["Admin"].emit('usuario desconectado', {mensaje: "El Usuario se encuantra desconectado"});
                
                    
            }else{
                
                users[data.para].emit('new message', {msg: data.mensaje, nick: socket.nickname});
            }

        }else{
            if(!users["Admin"]){
                users[socket.nickname].emit('Admin desconectado', {mensaje: "El administrados se encuantra desconectado"});

            }else{
                users["Admin"].emit('new message', {msg: data, nick: socket.nickname});
            }
        }
    });

    socket.on('disconnect', function(data){
        if(!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });

});