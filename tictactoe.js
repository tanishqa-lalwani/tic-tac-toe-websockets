var board = Array.from(Array(9).keys()); //to store the player value at 9 indexes of the grid
const position = document.querySelectorAll(".pos"); // to access boxes of the grid of tic tac toe

var btn = document.getElementById('new');
var display = document.getElementById('messages-display');
var text = document.getElementById('winning-text');
var winner;

// Get username and room from URL


var socket = io(); 
var player1 = null,player2 = null,symbol1 = 'X',symbol2 = 'O'; 
let isMyTurn = false;

// Emit events
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
var room1;
/*$('#new').on('click', () => {
    if (!username) {
      alert('Please enter your name.');
      return;
    }
    console.log('sending new Game');
  });*/
  console.log(room);
if(!room)
socket.emit('createGame', { username }); 
else if(room && username)
socket.emit('joinRoom', { username, room });
else 
alert('Please write name and room number');

/*
$('#submit').on('click', () => {
  console.log(name);

    if(!username || !room_number){
        
    }
   

});*/
socket.on("newGame", function (data){
  const message =
      `Hello, ${data.name}. Please ask your friend to enter Game ID: 
      ${data.room}. Waiting for player 2...`;
      display.innerText += message;
});
socket.on('getReady',function(data){
  console.log('getReady' , data.room)
  room1 = data.room;
 // player1 = data.player1;
 display.innerText = `Hello ${data.player2}, Your opponent ${data.player1} is ready!`;
  player2 = data.player2;
  isMyTurn = true;
  
  startGame();

});

socket.on('roomUsers', ({ room, users }) => {
  console.log("ayyeeeeeee");
  outputRoomName(room);
  outputUsers(users);
});
socket.on('startGame',function (data) {
  console.log("Helllo");
  display.innerText = `Hello ${data.player1}, Your opponent ${data.player2} is ready!`;

  room1  = room;
  player1 = data.player1;
  //player2 = data.player2;
  isMyTurn = false;
  /*setTimeout(function(){
    const box = document.getElementById('messages-sidebar');
    box.style.width = '250px';
    box.style.height = '250px';

   
  },1000);*/
 

  startGame();
});
function checkWin (){
  var winner;
  const b = this.board;
 const winningCombination = [
   [0, 1, 2],
   [3, 4, 5],
   [6, 7, 8],
   [0, 4, 8],
   [1, 4, 7],
   [0, 3, 6],
   [2, 5, 8],
   [6, 4, 2],
 ];
 for(var i=0;i<winningCombination.length ; i++) {
  const pos0 = b[winningCombination[i][0]];
  const pos1 = b[winningCombination[i][1]];
  const pos2 = b[winningCombination[i][2]];
  const isWinningCombo =  !Number.isInteger(pos0) &&
    pos0 == pos1 && pos1 == pos2;
  if (isWinningCombo) {
      winner = pos0;
      break;
  }

  

}

return winner;

}

socket.on('message', message =>{
  console.log(message);
  
  const div = document.createElement('div');
  div.classList.add('message');
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message;
  div.appendChild(para);
  document.querySelector('.output').appendChild(div);
  
});

function startGame() {
    // Start Game
    position.forEach(function (element) {
      element.addEventListener("click", turn, false); //when the box is clicked
    });
  }

  function turn(e) {
    if(!isMyTurn) return;
    const cellId = e.target;
    var id = $(this).attr('id');

    console.log(room);
    
    //to print the image of player on the boxes of the grid
    let player,symbol;
    if(player2){
    board[id] = symbol2;
    player = player2;
    symbol = symbol2;
    }
    else{
    board[id] = symbol1;
    player = player1;
    symbol = symbol1;
    }
    isMyTurn = !isMyTurn;
    document.getElementById(id).innerHTML =   board[id]   ;
    //$("#" +id).text(board[id]);
    display.innerText = `${player} has selected box ${id}`;
    socket.emit('updateBoard',{
      player: player,
      selectId : id,
      symbol : symbol,
      room :  room1 
      
  });

    var check = checkWin();
    console.log(check);
    if(check ){
      end(check);
    }
    else if(checkFilled()){
      end("tie");
    }
    


    
  

    
  }
  socket.on('update-move', function(data){
    board[data.selectId] = data.symbol;
    document.getElementById(data.selectId).innerHTML =   board[data.selectId];

    isMyTurn = true;
  });
  
  function checkFilled(){
    return  this.board.every(cell => Number.isInteger(cell) === false );
  }
    function end(player) {
    for (var i = 0; i < position.length; i++) {
      position[i].removeEventListener("click", turn); //boxes cannot be clicked once the game ends
    }
  
    if (player === "tie") {
      //winning statements
  
      
  
      display.innerText = "It's a Draw!";
    } else {
     
  
      if (player == 'O') {
        
        display.innerText  = "O Wins!";
      
      } else if (player == 'X') {
        
        display.innerText = "X Wins!";
       
      }
    }

    socket.emit('endResults',{
      result:player,
      room : room1
    })
  }

  socket.on('endGame', function(data){
    end(data.result);
  });
  
  function outputRoomName(room) {
    document.getElementById('room-name').innerText = room;
  }
  
  // Add users to DOM
  function outputUsers(users) {
    userList = document.getElementById('users');
    userList.innerHTML = '';
    users.forEach(user=>{
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }