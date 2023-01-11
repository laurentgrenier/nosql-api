
const neo4j = require('neo4j-driver')

const driver = neo4j.driver(process.env.NEO4J_URI, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD))
const session = driver.session()
  
class ArticlesNode {
    constructor(){
        this.name = 'Article'
    }

    async findAll(){        
        const query = 'MATCH (x:' + this.name + ') RETURN x'
        const result = await session.run(query)        
        return result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}});        
    }

    async insertOne(doc){  
        // static fields list      
        const query = 'CREATE(x:' + this.name + '{ref:$ref,content:$content, sentiment:$sentiment}) RETURN x'
        const result = await session.run(query, doc)        
        // free fields list
        //const query = 'CREATE(x:' + this.name + "{" + Object.key(doc).filter(key => key != "elementId").map(key => key + ":$" + key).join(",") + "}" + ' RETURN x'
        //const result = await session.run(query, doc)        
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }

    async insertMany(docs){
        var result;
        var results = []
        var query = ""

        for(let doc of docs){
            // static fields list
            query = 'CREATE(x:' + this.name + '{ref:$ref,content:$content, sentiment:$sentiment}) RETURN x'
            result = await session.run(query, doc)    
            // free fields list
            //query = 'CREATE(x:' + this.name + "{" + Object.keys(doc).filter(key => key != "elementId").map(key => key + ":$" + key).join(",") + "}" + ' RETURN x'
            //result = await session.run(query, doc)    
            if (result){
                results.push(result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0])
            }                
        }
        return results
    }

    async update(id, doc){        
        const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" SET ' + Object.keys(doc).map(key => "x." + key + " = " + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + ' RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }

    async delete(id){
        /* 
        // uncomment if you want to also delete relations (forced delete) 
        var result = await session.run('MATCH (x:' + this.name + ')-[r]->() WHERE elementId(x) = \"' + id + '\" DELETE r')
        console.debug("result 1 ", result)
        var result = await session.run('MATCH ()-[r]->(x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" DELETE r')
        console.debug("result 2 ", result)
        */
       const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" DELETE x'
        const result = await session.run(query)
        try {
            return result.summary.counters._stats
        } catch {
            // nothing   
        }
        return result
    }

    async findById(id){
        const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }
}

class EditorsNode {
    constructor(){
        this.name = 'Editor'
    }

    async findAll(){        
        const query = 'MATCH (x:' + this.name + ') RETURN x'
        const result = await session.run(query)        
        return result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}});        
    }

    async insertOne(doc){                
        const query = 'CREATE(x:' + this.name + "{" + Object.keys(doc).filter(key => key != "elementId").map(key => key + ":$" + key).join(",") + "})" + ' RETURN x'                
        const result = await session.run(query, doc)        
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }

    async insertMany(docs){
        var result;
        var results = []
        var query = ""

        for(let doc of docs){
            query = 'CREATE(x:' + this.name + "{" + Object.keys(doc).filter(key => key != "elementId").map(key => key + ":$" + key).join(",") + "})" + ' RETURN x'
            result = await session.run(query, doc)        
            if (result){
                results.push(result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0])
            }                
        }
        return results
    }

    async update(id, doc){     
        const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" SET ' + Object.keys(doc).map(key => "x." + key + " = " + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + ' RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }

    async delete(id){        
        const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" DELETE x'
        var result = await session.run(query)
        try {
            return result.summary.counters._stats
        } catch {
            // nothing   
        }
        return result
    }

    async findById(id){
        const query = 'MATCH (x:' + this.name + ') WHERE elementId(x) = \"' + id + '\" RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }
}

class WritesRelation {
    constructor(){
        this.name = 'WRITES'
        this.startClass = 'Editor'
        this.endClass = 'Article'

    }

    async findAll(){        
        const result = await session.run('MATCH ()-[x:' + this.name + ']->() RETURN x')                
        return result.records.map(r => {return {id:r._fields[0].elementId ,startId:r._fields[0].startNodeElementId, endId:r._fields[0].endNodeElementId,...r._fields[0].properties}});        
    }

    async insertOne(fromNodeId, toNodeId, doc){                
        const query = "MATCH (source:" + this.startClass + "),(target:" + this.endClass + ") " + 
            "WHERE elementId(source) = \"" + fromNodeId + "\" AND elementId(target) = \"" + toNodeId + "\" " +
            "CREATE (source)-[x:" + this.name + 
            "{" + Object.keys(doc).map(key => key + ":" + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + "}" + 
            "]->(target) RETURN x"
        
        const result = await session.run(query)                
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null        
    }

    async insertMany(docs){
        throw "not implemented"
    }

    async update(id, doc){        
        const query = 'MATCH ()-[x:' + this.name + ']->() WHERE elementId(x) = \"' + id + '\" SET ' + Object.keys(doc).map(key => "x." + key + " = " + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + ' RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,startId:r._fields[0].startNodeElementId, endId:r._fields[0].endNodeElementId,...r._fields[0].properties}})[0]:null        
    }

    async delete(id){                
        const query = 'MATCH ()-[x:' + this.name + ']->() WHERE elementId(x) = \"' + id + '\" DELETE x'
        var result = await session.run(query)
        try {
            return result.summary.counters._stats
        } catch {
            // nothing   
        }
        return result
    }

    async findById(id){        
        const query = 'MATCH ()-[x:' + this.name + ']->() WHERE elementId(x) = \"' + id + '\" RETURN x'
        const result = await session.run(query)
        return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,startId:r._fields[0].startNodeElementId, endId:r._fields[0].endNodeElementId,...r._fields[0].properties}})[0]:null        
    }
}



exports.ArticlesNode = ArticlesNode
exports.EditorsNode = EditorsNode
exports.WritesRelation = WritesRelation