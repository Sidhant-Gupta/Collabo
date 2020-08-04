var express = require('express');
var socket = require('socket.io');
let namespaces = require('./public/data/Namespace');
const { port } = require('./constants/envConfig');

var app = express();
var server = app.listen(4000, function () {
    console.log(`listening to request on port ${port}`);
});
var io = socket(server);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/board', async function (req, res, next) {
    console.log("hhh");
    res.render('board');
})



io.on('connection', function (socket) {
    let nsData = namespaces.map((ns) => {
        return {
            img: ns.img,
            endpoint: ns.endpoint
        }
    })
    console.log(nsData);
    socket.emit('nsList', nsData);

    socket.on('mouse', (data) => {
        console.log(data);
        socket.broadcast.emit('mouse',data);
    })
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
        nsSocket.on('mouse', (data) => {
            // Data comes in as whatever was sent, including objects
            console.log("Received: 'mouse' " + data.x + " " + data.y);

            // Send it to all other clients
            nsSocket.broadcast.emit('mouse', data);

            // This is a way to send to everyone including sender
            // io.sockets.emit('message', "this goes to everyone");

        });
    })
});

function updateNoOfUsers(namespace, roomName) {
    io.of(namespace.endpoint).to(roomName).clients((error, clients) => {
        io.of(namespace.endpoint).to(roomName).emit('updateUsers', clients.length);
    })
}
