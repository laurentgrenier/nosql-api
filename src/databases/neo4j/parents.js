const helpers = require('./helpers')
const neo4j = require('neo4j-driver')
const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD))
const session = driver.session()

if (session){
    console.debug("Neo4J database connected")
}
  
class Node {
    constructor(name) {
        this.name = name
    }

    async findAll(kvs=null){
        if (kvs){
            const query = helpers.getNodeFindByKeysValuesQuery(this.name, kvs) 
        } else {
            const query = helpers.getNodeFindAllQuery(this.name)
        }
         
        const result = await session.run(query)        
        return helpers.parseNodesResult(result)
    }

    async find(kvs=null){
        if (kvs){
            const query = helpers.getNodeFindByKeysValuesQuery(this.name, kvs) 
        } else {
            const query = helpers.getNodeFindAllQuery(this.name)
        }
         
        const result = await session.run(query)
        const items = helpers.parseNodesResult(result)
        return (items.length > 0?items[0]:null)
    }

    async insertOne(doc){          
        const query = helpers.getNodeInsertOneQuery(this.name, doc)
        const result = await session.run(query, doc)                
        return helpers.parseNodeResult(result)
    }

    async insertMany(docs){
        var result;
        var results = []
        var query = ""

        for(let doc of docs){
            // static fields list
            query = helpers.getNodeInsertOneQuery(this.name, doc)
            result = await session.run(query, doc)    
            
            if (result){
                results.push(helpers.parseNodeResult(result))
            }                
        }
        return results
    }

    async update(id, doc){        
        const query = helpers.getNodeUpdateQuery(this.name, id, doc)
        const result = await session.run(query)
        return helpers.parseNodeResult(result)
    }

    async delete(id){
        /* 
        // uncomment if you want to also delete relations (forced delete) 
        var result = await session.run('MATCH (x:' + this.name + ')-[r]->() WHERE elementId(x) = \"' + id + '\" DELETE r')
        console.debug("result 1 ", result)
        var result = await session.run('MATCH ()-[r]->(x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" DELETE r')
        console.debug("result 2 ", result)
        */
       const query = helpers.getNodeDeleteQuery(this.name, id)
        const result = await session.run(query)
        
        try {
            return {nodesDeleted:result.summary.counters._stats.nodesDeleted}

        } catch {
            // nothing   
        }
        return result
    }

    async findById(id){
        const query = helpers.getNodeFindByIdQuery(this.name, id)
        const result = await session.run(query)
        return helpers.parseNodeResult(result)
    }
}

class Relation {
    constructor(name, startClass, endClass){
        this.name = name
        this.startClass = startClass
        this.endClass = endClass
    }

    async findAll(){ 
        const query = helpers.getRelationFindAllQuery(this.name)
        const result = await session.run(query)                
        return helpers.parseRelationsResult(result)
    }

    async insertOne(fromNodeId, toNodeId, doc){                
        const query = helpers.getRelationInsertOneQuery(this.name, this.startClass, this.endClass, fromNodeId, toNodeId, doc)        
        const result = await session.run(query)                
        return helpers.parseRelationsResult(result)
    }

    async insertMany(docs){
        throw "not implemented"
    }

    async update(id, doc){        
        const query = helpers.getRelationUpdateQuery(this.name, id, doc)
        const result = await session.run(query)
        return helpers.parseRelationResult(result)
    }

    async delete(id){                
        const query = helpers.getRelationDeleteQuery(this.name, id)
        var result = await session.run(query)
        try {
            return result.summary.counters._stats
        } catch {
            // nothing   
        }
        return result
    }

    async findById(id){        
        const query = helpers.getRelationFindByIdQuery(this.name, id)
        const result = await session.run(query)
        return helpers.parseRelationResult(result)
    }
}

exports.Node = Node
exports.Relation = Relation