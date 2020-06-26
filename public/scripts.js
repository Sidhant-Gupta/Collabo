// import { joinNs } from "./joinNs";
var socket = io.connect('http://localhost:4000');
let nsSocket = "";
// var socket3=io.connect('http://localhost:4000/mozilla');
// var socket3=io.connect('http://localhost:4000/linux');


// Listen for events

socket.on('nsList', (nsData) => {
  let namespacesDiv = document.querySelector('.namespaces');
  namespacesDiv.innerHTML = "";
  nsData.forEach(ns => {
    namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src="${ns.img}" /></div>`
  });
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    console.log(elem);
    elem.addEventListener("click", (e) => {
      const nsEndpoint = elem.getAttribute('ns');
      joinNs(nsEndpoint);
      console.log("clicked",nsEndpoint);
    });
  })
  joinNs('/wiki');
})

function joinNs(endpoint) {
  if(nsSocket){
    nsSocket.close();
    document.querySelector('#user-input').removeEventListener('submit',formSubmission);
  }
  console.log("in joinNs");
  nsSocket = io.connect(`http://localhost:4000${endpoint}`);

  nsSocket.on('nsRoomLoad', (nsRooms) => {
    console.log("test")
    console.log(nsRooms);
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = "";
    nsRooms.forEach((room) => {
      let glyph = room.privateRoom ? 'lock' : 'globe';
      roomList.innerHTML += `<li class='room'><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
    });
    let roomNodes = document.getElementsByClassName('room');

      Array.from(roomNodes).forEach((elem) => {
        elem.addEventListener('click', (e) => {
          console.log(e.target.innerText);
          joinRoom(e.target.innerText);
        })
      })
      const topRoom = document.querySelector('.room'); // queryselector selecys the first one only
      const topRoomName = topRoom.innerText;
      console.log("clicked",topRoomName);
      joinRoom(topRoomName); 
  })

  document.querySelector('.message-form').addEventListener('submit',formSubmission);

  nsSocket.on("messageToClients",(fullMsg)=>{
    console.log(fullMsg);
    const newMessage=buildHtml(fullMsg);
    document.querySelector('#messages').innerHTML+=newMessage;
  })
  
}

function formSubmission(event){
  event.preventDefault();
  const newMessage=document.querySelector('#user-message').value;
  nsSocket.emit('messageToServer',newMessage);
}


function joinRoom(roomName){
  nsSocket.emit('joinRoomEvent',roomName,(numberOfMembers)=>{
    document.querySelector('.curr-room-num-users').innerHTML=`${numberOfMembers} <span class="glyphicon glyphicon-user"></span>`;
  });

  nsSocket.on('history',(history)=>{
    const messageUI=document.querySelector('#messages');
    messageUI.innerHTML="";
    history.forEach((hist)=>{
      const newMsg=buildHtml(hist);
      const currentMessage=messageUI.innerHTML;
      messageUI.innerHTML=currentMessage +newMsg;
    })
    messageUI.scrollTo(0,messageUI.scrollHeight);
  })

  nsSocket.on('updateUsers',(noOfUsers)=>{
    document.querySelector('.curr-room-text').innerText=`${roomName} `;
    document.querySelector('.curr-room-num-users').innerHTML=`${noOfUsers} <span class="glyphicon glyphicon-user"></span>`;
  });

  let searchBox=document.querySelector("#search-box");
  searchBox.addEventListener('input',(e)=>{
    console.log(e.target.value);
    let messages=Array.from(document.getElementsByClassName('message-text'));
    console.log(messages);
    messages.forEach((msg)=>{
      if(msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase(  ))===-1)
        msg.style.display="none";
      else
        msg.style.display="block";
    })
  })

}

function buildHtml(msg){
  const newHtml=`
  <li>
  <div class="user-image">
      <img src=${msg.avatar}/>
  </div>
  <div class="user-message">
      <div class="user-name-time">${msg.username} <span>${msg.time}</span></div>
      <div class="message-text">${msg.msg}</div>
  </div>
  </li> `
  return newHtml;
}
