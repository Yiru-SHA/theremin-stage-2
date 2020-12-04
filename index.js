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

// 1.x.x socket version, npm: let io = require('socket.io').listen(server);
// 0.9.x socket version npm: let io = require('socket.io')(server)
let io = require('socket.io')(server);

io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    socket.on('disconnect',function(){
        console.log("socket disconected"+socket.id);
        counter--;
        let disconnectUser ={
            "UserID" : socket.id,
            "UserLeft":counter
        }
        io.sockets.emit(disconnectUser);
    })

    

});