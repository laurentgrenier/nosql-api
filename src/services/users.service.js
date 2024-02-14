const Service = require('./service.js')
const { CacheCollectionsEnum } = require('../enums/collections.enums.js')

class UsersService extends Service {
  constructor(logger, dal, socket, apis) {
    super(logger, dal, socket, apis)            
  }

  async getConnected(){
      const usersConnectedCache = new this.dal.cache.UsersConnectedCache()
      const users = await usersConnectedCache.list()
      console.debug("[users.service::getConnected] users", users)
    
      return users
  }

  async flushAllConnected(){
    const usersConnectedCache = new this.dal.cache.UsersConnectedCache()
    const result = await usersConnectedCache.delAll()
    console.debug("[users.service::getConnected] flushAllConnected", result)
  
    return result
  }

  async keepalive(executed_at){
    let socket_id = null
    console.debug("[UsersService::keepalive] start")      
    const usersConnectedCache = new this.dal.cache.UsersConnectedCache()
    const users = await usersConnectedCache.list()
    for(let user of users){      
      socket_id = user.key.replace(CacheCollectionsEnum.USERS_CONNECTED,"")  
      console.debug("[UsersService::keepalive] checking socket_id", socket_id)
      await usersConnectedCache.setExpire(socket_id, process.env.KEEPALIVE_ANSWER_DELAY)
      this.socket.to(socket_id).emit("keepalive", {timestamp:executed_at.getTime()})
    }
  }
}

module.exports = UsersService
