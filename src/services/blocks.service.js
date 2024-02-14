const { CacheCollectionsEnum } = require('../enums/collections.enums.js')
const Service = require('./service.js')

class BlocksService extends Service {
  constructor(logger, dal, socket, apis) {
    super(logger, dal, socket, apis)            
  }

  async send(block){
    let socket_id = null
      console.debug("[block.service::send] block", block)      
      const usersConnectedCache = new this.dal.cache.UsersConnectedCache()
      const users = await usersConnectedCache.list()

    for(let user of users){
      socket_id = user.key.replace(CacheCollectionsEnum.USERS_CONNECTED,"")  
      console.debug("[block.service::send] socket_id: ", socket_id)
      this.socket.to(socket_id).emit("new-block", JSON.stringify(block))
    }

    return users
  }
}

module.exports = BlocksService
