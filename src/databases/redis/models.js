
const redis = require('redis');
const { CacheCollectionsEnum } = require('../../enums/collections.enums');

const client = redis.createClient({
  socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
  }
});

client.connect().then(() => console.debug("REDIS database connected")).catch((error) => {
    console.error("!!! REDIS database not connected")
})

client.flushDb()

class HostsReadsCache {
    constructor(){
        
        this.name = 'hosts:reads'        
    }

    setExpire(key){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return true
    }

    // add an user and his informations to the cache 
    set(key,value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return client.set(this.name + ":" + key, value)        
    }
    
    get(key){
        return client.get(this.name + ":" + key)  
    }

    del(key){
        return client.del(this.name + ":" + key)  
    }

    exists(key){
        return client.exists(this.name + ":" + key)
    }

    async list() {
        let result = []
        for(let key of await client.keys(this.name + ':*')){
            result.push(JSON.parse(await client.get(key)))
        }
        return result
    }

    incr(key, value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return client.incrBy(this.name + ":" + key, value)        
    }

    async asyncIncr(key, value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)        
        return await client.incrBy(this.name + ":" + key, value)        
    }
}

class UsersConnectedCache {
    constructor(){        
        this.name = CacheCollectionsEnum.USERS_CONNECTED
    }

    setExpire(key){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return true
    }
    
    // add an user and his informations to the cache 
    set(key,value){
        client.expire(this.name + key, process.env.REDIS_EXPIRATION)
        return client.set(this.name + key, value)        
    }
    
    get(key){
        return client.get(this.name + key)  
    }

    del(key){
        return client.del(this.name + key)  
    }

    async delAll(){
        let count = 0
        for(let key of await client.keys(this.name + '*')){                        
            count += (await client.del(key))            
        }

        return {deleted:count}        
    }

    exists(key){
        return client.exists(this.name + key)
    }

    async list() {
        let value = null
        let result = []
        for(let key of await client.keys(this.name + '*')){
            console.debug("key value", await client.get(key))
            value = await client.get(key)
            try {
                result.push({key:key, value:JSON.parse(value)})    
            } catch (error) {
                result.push({key:key, value:value})
            }
            
        }
        return result
    }
}

class HostsWritesCache {
    constructor(){
        
        this.name = 'hosts:writes'        
    }

    // add an user and his informations to the cache 
    set(key,value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return client.set(this.name + ":" + key, value)        
    }
    
    get(key){
        return client.get(this.name + ":" + key)          
    }

    del(key){
        return client.del(this.name + ":" + key)  
    }

    exists(key){
        return client.exists(this.name + ":" + key)
    }

    async list() {
        let result = []
        for(let key of await client.keys(this.name + ':*')){
            result.push(JSON.parse(await client.get(key)))
        }
        return result
    }

    incr(key, value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
        return client.incrBy(this.name + ":" + key, value)        
    }

    async asyncIncr(key, value){
        client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)        
        return await client.incrBy(this.name + ":" + key, value)        
    }
}



exports.HostsReadsCache = HostsReadsCache
exports.HostsWritesCache = HostsWritesCache
exports.UsersConnectedCache = UsersConnectedCache