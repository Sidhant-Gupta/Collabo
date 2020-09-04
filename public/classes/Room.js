class Room{
  constructor(roomId,roomTitle,namespace,privateRoom=false){
    this.roomId=roomId;
    this.roomTitle=roomTitle;
    this.namespace=namespace;
    this.privateRoom=privateRoom;
    this.history=[];
    this.boardHistory=[];
  }

  addMessage(message){
    this.history.push(message);
  }

  clearHistory(){
    this.history=[];
  }

  addMessageBoard(message){
    this.boardHistory.push(message);
  }
}

module.exports=Room;