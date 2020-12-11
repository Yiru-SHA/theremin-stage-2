let express = require('express');
let app = express();
app.use('/', express.static('public'));


//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log("Server listening at port: " + port);
});


// initialize socket.io
let io = require('socket.io')().listen(server);

let counter = 0;
//let idIndex = [];


io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('disconnect',function(){
        console.log("socket disconected"+socket.id);
        let disconnectUser ={
            "UserID" : socket.id
        }
        io.sockets.emit(disconnectUser);
    })

    socket.on('joined',()=>{
        counter++;
        let idIndex = {
            "UserID" : socket.id,
            "UserJoined":counter
    }
        io.sockets.emit('joined',(idIndex));
        console.log(idIndex);
    });

    socket.on('WristData',(data)=>{
        console.log("one client",data);
        //idIndex.push(data.idIndex);
        io.sockets.emit('AllWristData',(data));
        console.log("sendout all wristdata",data);
    })

});

