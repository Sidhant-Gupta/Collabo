var express = require('express');
var socket = require('socket.io');
let namespaces = require('./public/data/Namespace');
const port = 4000 || process.env.PORT;

var app = express();
var server = app.listen(port, function () {
    console.log(`listening to request on port ${port}`);
});
var io = socket(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/:nspace', async function (req, res, next) {
    console.log("query", req.query.room);
    res.render('board', { nspace: req.params.nspace, room: req.query.room });
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
})

namespaces.forEach(namespace => {
    io.of(namespace.endpoint).on('connection', (nsSocket) => {
        console.log("HANDSHAKE", nsSocket.handshake);
        console.log("namespace", namespace.endpoint);
        console.log(`${nsSocket.id} has joined ${namespace.nsTitle}`);

        const username = nsSocket.handshake.query.username;
        nsSocket.emit('nsRoomLoad', namespace.rooms);

        nsSocket.on('joinRoomEvent', (roomName, noOfUsersCallback) => {
            let prevRoom = Object.keys(nsSocket.rooms)[1];
            nsSocket.leave(prevRoom);
            updateNoOfUsers(namespace, roomName);
            nsSocket.join(roomName);
            updateNoOfUsers(namespace, roomName);
            console.log("ROOM ", roomName);
            // .clients() gets the no of users conneted to namspace or that room 
            const nsRoom = namespace.rooms.find((room) => {
                // console.log(room.roomTitle);
                return room.roomTitle === roomName;
            })
            console.log("joined room ", nsRoom);

            nsSocket.emit('history', nsRoom.history);
            nsSocket.emit('boardHistory', nsRoom.boardHistory);

        })

        nsSocket.on('messageToServer', (text) => {
            const fullMessage = {
                msg: text,
                time: new Date(),
                username: username,
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

        // drawing on board
        nsSocket.on('mouse', (data) => {
            console.log("Received: 'mouse' " + data.x + " " + data.y);
            nsSocket.broadcast.to(data.room).emit('mouse', data);
        });

        // Messages from board chat
        nsSocket.on('chat', (chat) => {

            const nsRoom = namespace.rooms.find((room) => {
                return room.roomTitle === chat.room;
            });
            nsRoom.addMessageBoard(chat);
            io.of(namespace.endpoint).to(nsRoom.roomTitle).emit('chat', chat);
        })
    })
});

function updateNoOfUsers(namespace, roomName) {
    io.of(namespace.endpoint).to(roomName).clients((error, clients) => {
        io.of(namespace.endpoint).to(roomName).emit('updateUsers', clients.length);
    })
}
