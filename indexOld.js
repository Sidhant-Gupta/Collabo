var express=require('express');
var bodyParser = require("body-parser");
var socket=require('socket.io');
var mqttHandler = require('./public/mqtt_handler');

var app=express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
  

var server=app.listen(4000,function(){
    console.log("listening to request on port 4000");
});

var io=socket(server);

app.post("/send-mqtt", function(req, res) {
    mqttClient.sendMessage(req.body.message);
    res.status(200).send("Message sent to mqtt");
  });

app.use(express.static('public'));


const getConnectedUser=()=>{
    let clients=io.sockets.clients().connected;
    let sockets=Object.values(clients);
    let users=sockets.map(s=>s.user); 
    return users;
}

const emitUsers=()=>{
    io.emit("visitors",getConnectedUser());
}


io.on('connection',function(socket){
    console.log("made socket connection",socket.id);

    socket.emit('message',{data:'Welcome'});

    socket.on('pong',()=>{
        console.log("pong recieved");
    })
     

    socket.on("newVisitor",user=>{
        console.log("new Visitor");
        socket.user=user;
        emitUsers();
    })

    socket.on('disconnect',function(){
        console.log("User disconnected");
    })

    socket.on('chat',function(data){
        io.emit('chat',data); 
    });

    socket.on('typing',function(data){
        socket.broadcast.emit('typing',data);
    })
})

io.of('/admin').on('connection',(socket)=>{
    console.log("socket admin");
    socket.emit('welcome',"socket2 ");
})
