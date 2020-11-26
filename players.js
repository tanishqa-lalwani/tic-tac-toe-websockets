const players = [];
const symbol = 'X';
function playerJoin(username,roomNumber,newUser,isTurn){

    const player = {username,roomNumber,newUser,isTurn};
    players.push(player);
    return player;
}

module.exports = {playerJoin};