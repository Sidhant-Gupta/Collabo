var socket;
function setup() {
  let cnv = createCanvas(700, 500);
  background(0);
  cnv.position(200, 150);
  socket = io.connect('http://localhost:4000');
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('mouse', (data) => {
    console.log("Got: " + data.x + " " + data.y);
    // Draw a blue circle
    fill(0, 0, 255);
    noStroke();
    ellipse(data.x, data.y, 20, 20);
  }
  );
}

function windowResized() {
  resizeCanvas(800, 500);
}

function mouseDragged() {
  // Draw some white circles
  fill(255);
  noStroke();
  ellipse(mouseX, mouseY, 20, 20);
  // Send the mouse coordinates
  sendmouse(mouseX, mouseY);
}

// Function for sending to the socket
function sendmouse(xpos, ypos) {
  // We are sending!
  console.log("sendmouse: " + xpos + " " + ypos);

  // Make a little object with  and y
  var data = {
    x: xpos,
    y: ypos
  };

  // Send that object to the socket
  socket.emit('mouse', data);
}

// Query DOM
var message = document.getElementById('message'),
  handle = document.getElementById('handle'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback');

// Emit events
btn.addEventListener('click', function () {
  socket.emit('chat', {
    message: message.value,
    handle: handle.value
  });
  message.value = "";
});

message.addEventListener('keypress', function () {
  socket.emit('typing', handle.value);
})

// Listen for events
socket.on('connect', () => {
  console.log("id", socket.id);
  // console.log(socket.connected);
  // console.log(socket.open);
})

socket.on('chat', function (data) {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function (data) {
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});

socket.on('message', function (data) {
  console.log(data);
});