const util = require('util')
const socketioJwt = require('socketio-jwt')
const { AUTH_SECRET, SOCKET_ORIGINS } = process.env
const Crypto = require('../libs/crypto.lib')
const { SocketEventEnum } = require('../enums/socket.enums')

module.exports = function (server, cache) {
  // console.debug("init sockets with origins ", SOCKET_ORIGINS)  
  let io = require('socket.io')(server, {    
    cors:{
      origin: SOCKET_ORIGINS,
    }
  })

  io.users = []
  
  io.on('error', err => console.debug("socket error", err))

  /*io.use(socketioJwt.authorize({
    secret: AUTH_SECRET,
    handshake: true
  }))*/

  io.on(SocketEventEnum.CONNECTION.toString(), (socket) => {
    // console.log('a user connected', socket.id, socket.decoded_token.user_id);  
    
    // let currentIndex = io.users.filter(user => user.id == socket.decoded_token.user_id)

    /*if (currentIndex > -1){
      io.sockets.get(io.users[currentIndex].sid).disconnect()
    }*/

    console.debug("[socket] [:connection] socket.id", socket.id)
    //console.debug("[socket] [:connection] socket.decoded_token.data", socket.decoded_token.data)
    /*let decrytped_token = Crypto.decrypt(socket.decoded_token.data)
    if (decrytped_token){
      decrytped_token = JSON.parse(decrytped_token)
      if (decrytped_token.user_id){
        io.users.push({user_id:decrytped_token.user_id, sid:socket.id, lastalive:new Date().getTime()})          
      }
      else {
        throw "wrong token format"
      }      
    } else {
      throw "unauthorized"
    }*/
    
    socket.on(SocketEventEnum.DISCONNECT.toString(), () => {      
      console.debug("[socket] [:disconnect] socket.id", socket.id)
      //console.debug("[socket] [:disconnection] socket.decoded_token.data", socket.decoded_token.data)
      /*let decrytped_token = Crypto.decrypt(socket.decoded_token.data)
      if (decrytped_token){
        decrytped_token = JSON.parse(decrytped_token)        if (decrytped_token.user_id){
          io.users.splice(io.users.findIndex(u => u.user_id === decrytped_token.user_id), 1)          
        }
        else {
          throw "wrong token format"
        }      
      } else {
        throw "unauthorized"
      }      */
    }); 

    socket.on(SocketEventEnum.NEW_USER.toString(), (strDoc) => {       
        console.debug("[socket] [:new-user] strDoc",strDoc); // "world"        
        const usersConnectedCache = new cache.UsersConnectedCache()   
        usersConnectedCache.set(socket.id, strDoc)
    })

    socket.on(SocketEventEnum.KEEPALIVE.toString(), (strDoc) => {       
      console.debug("[socket] [:keepalive] strDoc",strDoc); // "world"        
      const usersConnectedCache = new cache.UsersConnectedCache()         
      usersConnectedCache.setExpire(socket.id, process.env.REDIS_EXPIRATION)
    })
  });

  
 
  return io    
}
