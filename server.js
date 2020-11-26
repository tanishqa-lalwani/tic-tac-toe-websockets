var http = require('http');

var express = require('express');
var socket = require('socket.io');


const {
    userJoin,
    userLeave,
    getRoomUsers
  } = require('./utils/user.js');
const  {playerJoin} = require('./utils/players.js');

// App setup
var app = express();
/*var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});*/

// Static files

var server = http.createServer(app);

var io = socket(server);
app.use(express.static('public'));
app.get('/', function (req, res) {
   res.sendFile(__dirname + '/tictactoe.html');
});

let onlineCount = 0;

io.on('connection', (socket) => {
    console.log('made socket connection', socket.id);

    socket.on('createGame' , function(data){
        console.log('received create game from'+data);
        socket.join(`${++onlineCount}`);
        playerJoin(data.username, `${onlineCount}`,true,true);
        console.log(data.username);
        userJoin(socket.id,data.username,`${onlineCount}`);
        socket.emit('newGame', { name: data.username, room: `${onlineCount}` })

    });
    socket.on('joinRoom', ({ username, room }) => {

        playerJoin(username,room,false,false);
        const rooms =  getRoomUsers(room);

        console.log(rooms.length);

        if (rooms && rooms.length === 1) {
            const user = userJoin(socket.id, username, room);
            socket.join(user.room);


        io.to(rooms[0].room).emit('message', `Hello ${user.username},${rooms[0].username}, Welcome to the game !!`);
        console.log(user.username + rooms[0].username);
        socket.broadcast.to(rooms[0].room).emit('getReady',{
            player1 : username,
            player2 : rooms[0].username,
            room : rooms[0].room
        });
        console.log(getRoomUsers(user.room));
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
          });
            socket.emit('startGame', {
                player1 : username,
                player2 : rooms[0].username,
            });
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
  
    });

    socket.on('updateBoard',function(data){
        console.log("h",data.room);
        socket.broadcast.to(data.room).emit('message', `${data.player} has selected box ${data.selectId}`
        );
        socket.broadcast.to(data.room).emit('update-move' ,{
            selectId: data.selectId,
            symbol : data.symbol
        });
    });
    socket.on('endResults',function(data){
        
        socket.broadcast.to(data.room).emit('endGame' , {
            result: data.result
        });
        


    });
    //console.log(opponent);
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
    
        if (user) {
          io.to(user.room).emit(
            'message', `${user.username} has left the chat`
          );
            
          // Send users and room info
          
        }
      });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
