var socket;
var message, handle, btn, output, feedback, nspace, room;

function setup() {
  let cnv = createCanvas(700, 500);
  background(40);
  cnv.position(200, 150);

  var mouseIsDragged = false;
  message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    nspace = document.getElementById('nspace').innerHTML,
    room = document.getElementById('room').innerHTML;

  console.log("nspace  ", nspace);
  console.log("room  ", room);

  socket = io.connect(`http://localhost:4000/${nspace}`);
  joinRoom(room);

  // BOARD
  socket.on('mouse', (data) => {
    console.log("Got: " + data.x + " " + data.y);
    fill(114,196,212);
    noStroke();
    ellipse(data.x, data.y, 20, 20);
  });


  // CHAT
  btn.addEventListener('click', function () {
    console.log("Send button clicked");
    socket.emit('chat', {
      message: message.value,
      handle: handle.value,
      room: room
    });
    message.value = "";
  });

  socket.on('boardHistory', (history) => {
    output.innerHTML = "";
    history.forEach((hist) => {
      const newMsg = buildHtml(hist);
      const currentMessage = output.innerHTML;
      output.innerHTML = currentMessage + newMsg;
    })
    output.scrollTo(0, output.scrollHeight);
  })

  socket.on('chat', function (data) {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
  });

  // message.addEventListener('keypress', function () {
  //   socket.emit('typing', handle.value);
  // })

  // socket.on('typing', function (data) {
  //   feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  // });
}

function mouseDragged() {
  // Draw some white circles
  fill(255);
  noStroke();
  ellipse(mouseX, mouseY, 20, 20);
  sendmouse(mouseX, mouseY);
}

function sendmouse(xpos, ypos) {
  console.log("sendmouse: " + xpos + " " + ypos);
  var data = {
    x: xpos,
    y: ypos,
    room: room
  };
  socket.emit('mouse', data);
}

function joinRoom(roomName) {
  socket.emit('joinRoomEvent', roomName, (numberOfMembers) => {
    console.log(numberOfMembers);
  });
}

function buildHtml(msg) {
  const newHtml = `<p><strong>  ${msg.handle}  : </strong>  ${msg.message} </p>`
  return newHtml;
}