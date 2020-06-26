function joinNs(endpoint) {
  console.log("in joinNs");
  nsSocket = io.connect(`http://localhost:4000${endpoint}`);

  nsSocket.on('nsRoomLoad', (nsRooms) => {
    console.log(nsRooms);
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = "";
    nsRooms.forEach((room) => {
      let glyph = room.privateRoom ? 'lock' : 'globe';
      roomList.innerHTML += `<li class='room'><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
      let roomNodes = document.getElementsByClassName('room');

      Array.from(roomNodes).forEach((elem) => {
        elem.addEventListener('click', (e) => {
          console.log(e.target);
        })
      })
      const topRoom = document.querySelector('.room');
      const topRoomName = topRoom.innerText;
      console.log(topRoomName);
      // joinRoom(topRoomName);

    });
  })
}

// module.exports=joinNs;
