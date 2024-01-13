
const { SOCKET_ORIGINS } = process.env

module.exports = function () {
  const server = require('http').createServer();

  let io = require('socket.io')(server, {    
    cors:{
      origin: SOCKET_ORIGINS,
    }
  })

  io.users = []
  
  io.on('error', err => console.debug("socket error", err))

  io.on('connection', (socket) => {
    // add the user to the socket users
    io.users.push({sid:socket.id})          
    // instantiante the removal of the socket user
    socket.on('disconnect', (socket) => {      
        io.users.splice(io.users.findIndex(u => u.sid === socket.id), 1)          
    }); 
  });
  server.listen(3001);
  return io    
}
