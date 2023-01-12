
const redis = require('redis');

const client = redis.createClient({
  socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
  }
});

client.connect()

class UsersCache {
    constructor(){
        this.name = 'users'        
        
        // create subscriber 
        this.subscriber =  client.duplicate();
        // connect to the subscriber        
        this.subscriber.connect();
        // add a subscription
        this.subscriber.subscribe('instants', (instant) => {
            console.log("user receive instant", instant); 
            this.instantReceivedHandler(JSON.parse(instant))
        });        
    }

    async instantReceivedHandler(instant){        
        for(let key of await client.keys(this.name + ':' + instant.key)){
            let user = JSON.parse(await client.get(key))        
            let user_instants = [instant.message] 
            user.instants = (user.instants?user.instants:[]).concat(user_instants)   
            console.debug("new user", user)          
            this.set(key.split(':')[1], user)
        }                
    }    

    // add an user and his informations to the cache 
    set(key,value){
        client.set(this.name + ":" + key, JSON.stringify(value))
        return client.expire(this.name + ":" + key, process.env.REDIS_EXPIRATION)
    }
    
    get(key){
        return client.get(this.name + ":" + key)  
    }

    del(key){
        return client.del(this.name + ":" + key)  
    }

    async list() {
        let result = []
        for(let key of await client.keys(this.name + ':*')){
            result.push(JSON.parse(await client.get(key)))
        }
        return result
    }
}



class InstantsPublisher {
    constructor(){
        this.name = 'instants'       
          // create subscriber 
        this.publisher = client.duplicate();
        this.publisher.connect();        
    }

    // add an user and his informations to the cache 
    set(key, value){                        
        return this.publisher.publish(this.name, JSON.stringify({key:key, ...value}));
    }    
}


exports.UsersCache = UsersCache
exports.InstantsPublisher = InstantsPublisher