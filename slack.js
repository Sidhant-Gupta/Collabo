var express = require('express');
var bodyParser = require("body-parser");
var socket = require('socket.io');
let namespaces = require('./public/data/Namespace');

var app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))

var server = app.listen(4000, function () {
    console.log("listening to request on port 4000");
});
var io = socket(server);
app.use(express.static('public'));



io.on('connection', function (socket) {
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    console.log(nsData);
    socket.emit('nsList', nsData);
})

namespaces.forEach(namespace => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        console.log("namespace", namespace.endpoint);
        console.log(`${nsSocket.id} has joined ${namespace.nsTitle}`);

        nsSocket.emit('nsRoomLoad', namespace.rooms);

        nsSocket.on('joinRoomEvent', (roomName, noOfUsersCallback) => {
            let prevRoom = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(prevRoom);
            updateNoOfUsers(namespace, roomName);
            nsSocket.join(roomName);
            updateNoOfUsers(namespace, roomName);
            // .clients() gets the no of users conneted to namspace or that room 
            const nsRoom = namespace.rooms.find((room) => {
                // console.log(room.roomTitle);
                return room.roomTitle === roomName;
            })
            console.log("joined room ", nsRoom);

            nsSocket.emit('history', nsRoom.history);

        })
        nsSocket.on('messageToServer', (text) => {
            const fullMessage = {
                msg: text,
                time: new Date(),
                username: "Sidhant",
                avatar: 'https://via.placeholder.com/30'
            }
            console.log(fullMessage);
            console.log(nsSocket.rooms);
            const roomTitle = Object.keys(nsSocket.rooms)[1];
            console.log(roomTitle);

            console.log("namespace", namespace.rooms);
            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === roomTitle;
            });
            console.log("room", nsRoom);

            nsRoom.addMessage(fullMessage);
            console.log("history", nsRoom.history);

            io.of(namespace.endpoint).to(roomTitle).emit("messageToClients", fullMessage);
        })


    })
});

function updateNoOfUsers(namespace, roomName) {
    io.of(namespace.endpoint).to(roomName).clients((error, clients) => {
        io.of(namespace.endpoint).to(roomName).emit('updateUsers', clients.length);
    })
}
