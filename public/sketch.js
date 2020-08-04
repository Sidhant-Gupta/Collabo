var socket;
var socketChat = io.connect('http://localhost:4000');

var mouseIsDragged = false;


function setup() {
  let cnv = createCanvas(700, 500);
  background(0);
  cnv.position(200, 150);
  // cnv.parent(elem);
  socket = io.connect('http://localhost:4000');



  socket.on('mouse', (data) => {
    console.log("Got: " + data.x + " " + data.y);
    fill(0, 0, 255);
    noStroke();
    ellipse(data.x, data.y, 20, 20);
  }
  );

  var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');

  // Emit events
  // btn.mousePressed(() => {
  //   console.log("holaaaaaaaaaaa");
  //   socketChat.emit('chat', {
  //     message: message.value,
  //     handle: handle.value
  //   });
  //   message.value = "";
  // })
  btn.addEventListener('click', function () {
    console.log("holaaaaaaaaaaa");
    socketChat.emit('chat', {
      message: message.value,
      handle: handle.value
    });
    message.value = "";
  });

  message.addEventListener('keypress', function () {
    socketChat.emit('typing', handle.value);
  })

  // Listen for events
  socketChat.on('connect', () => {
    console.log("id", socket.id);
    // console.log(socket.connected);
    // console.log(socket.open);
  })

  socketChat.on('chat', function (data) {
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
  });

  socketChat.on('typing', function (data) {
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  });

  socketChat.on('message', function (data) {
    console.log(data);
  });
}

// function windowResized() {
//   resizeCanvas(800, 500);
// }


// elem.mousePressed = function () {
//   mouseIsDragged = true;

//   // The global event might need to be cleaned up after released to avoid memory leaks
//   global.mouseReleased = function () {
//     mouseIsDragged = false;
//   }
// }

// elem.mouseMoved = function () {
//   if (mouseIsDragged) {
//     // Draw some white circles
//     fill(255);
//     noStroke();
//     ellipse(mouseX, mouseY, 20, 20);
//     sendmouse(mouseX, mouseY);
//   }
// }

// elem.mouseReleased = function () {
//   mouseIsDragged = false;
// }

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
    y: ypos
  };
  socket.emit('mouse', data);
}

// Query DOM
var message = document.getElementById('message'),
  handle = document.getElementById('handle'),
  btn = document.getElementById('send'),
  output = document.getElementById('output'),
  feedback = document.getElementById('feedback');

// Emit events
btn.mousePressed(() => {
  console.log("holaaaaaaaaaaa");
  socketChat.emit('chat', {
    message: message.value,
    handle: handle.value
  });
  message.value = "";
})
btn.addEventListener('click', function () {
  console.log("holaaaaaaaaaaa");
  socketChat.emit('chat', {
    message: message.value,
    handle: handle.value
  });
  message.value = "";
});

message.addEventListener('keypress', function () {
  socketChat.emit('typing', handle.value);
})

// Listen for events
socketChat.on('connect', () => {
  console.log("id", socket.id);
  // console.log(socket.connected);
  // console.log(socket.open);
})

socketChat.on('chat', function (data) {
  feedback.innerHTML = '';
  output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socketChat.on('typing', function (data) {
  feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});

socketChat.on('message', function (data) {
  console.log(data);
});