const { HostStatusEnum } = require("../../enums/blockdb.enums")

const getNodeFindAllQuery = (name) => {
    return 'MATCH (x:' + name + ') RETURN x'
}

const getNodeInsertOneQuery = (name, doc) => {
    return 'CREATE(x:' + name + "{" + Object.keys(doc).filter(key => key != "elementId").map(key => key + ":$" + key).join(",") + "})" + ' RETURN x'                
}

const getNodeUpdateQuery = (name, id, doc) => {
    return 'MATCH (x:' + name + ') WHERE elementId(x) = \"' + id + '\" SET ' + Object.keys(doc).map(key => "x." + key + " = " + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + ' RETURN x'
}

const getNodeDeleteQuery = (name, id) => {
    return 'MATCH (x:' + name + ') WHERE elementId(x) = \"' + id + '\" DELETE x'
}

const getNodeFindByIdQuery = (name, id) => {
    return 'MATCH (x:' + name + ') WHERE elementId(x) = \"' + id + '\" RETURN x'
}

const getNodeFindByKeysValuesQuery = (name, kvs) => {
    return 'MATCH (x:' + name + ') WHERE ' + Object.keys(kvs).map(key => "x." + key + " = " + (typeof(kvs[key]) === "string"?"\"" + kvs[key] + "\"":kvs[key])).join(",") + ' RETURN x'
}

const parseNodesResult = (result) => {
    return result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}});    
}

const parseRequestResult = (result) => {    
    return result.records.map(r => {
        let row = {}
        for(var i=0;i<r.keys.length;i++){
            row[r.keys[i]] = r._fields[i]
        }
        return row
    })
}

const parseNodeResult = (result) => {
    return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,...r._fields[0].properties}})[0]:null
}

const getRelationFindAllQuery = (name) => {        
    return 'MATCH ()-[x:' + name + ']->() RETURN x'
}

const getRelationInsertOneQuery = (name, startClass, endClass, fromNodeId, toNodeId, doc) => {                
    return "MATCH (source:" + startClass + "),(target:" + endClass + ") " + 
        "WHERE elementId(source) = \"" + fromNodeId + "\" AND elementId(target) = \"" + toNodeId + "\" " +
        "CREATE (source)-[x:" + name + 
        "{" + Object.keys(doc).map(key => key + ":" + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + "}" + 
        "]->(target) RETURN x"
}

const getRelationUpdateQuery = (name, id, doc) => {        
    return 'MATCH ()-[x:' + name + ']->() WHERE elementId(x) = \"' + id + '\" SET ' + Object.keys(doc).map(key => "x." + key + " = " + (typeof(doc[key]) === "string"?"\"" + doc[key] + "\"":doc[key])).join(",") + ' RETURN x'
}

const getRelationDeleteQuery = (name, id) => {                
    return 'MATCH ()-[x:' + name + ']->() WHERE elementId(x) = \"' + id + '\" DELETE x'    
}

const getRelationFindByIdQuery = (name,id) => {        
    return 'MATCH ()-[x:' + name + ']->() WHERE elementId(x) = \"' + id + '\" RETURN x'
}

const parseRelationsResult = (result) => {
    return result.records.map(r => {return {id:r._fields[0].elementId ,startId:r._fields[0].startNodeElementId, endId:r._fields[0].endNodeElementId,...r._fields[0].properties}});        
}

const parseRelationResult = (result) => {
    return result.records.length > 0?result.records.map(r => {return {id:r._fields[0].elementId ,startId:r._fields[0].startNodeElementId, endId:r._fields[0].endNodeElementId,...r._fields[0].properties}})[0]:null 
}

// blockchain
const getLeafBlockNodeQuery = (chainId) => {    
    return 'MATCH (leaf:Block{chain_id:"' + chainId + '"})-[:CHAINED_TO]->(),' +
        '(leaf)-[:HOSTED_BY]->(h:Host{active:' + HostStatusEnum.ACTIVE.valueOf().toString() + '}) ' +
        'WHERE NOT ()-[:CHAINED_TO]->(leaf) ' + 
        'RETURN DISTINCT elementId(leaf) as id'
}

const getChainNodes = (chainId) => {
    return 'MATCH path=(leaf:Block{chain_id:"' + chainId + '"})-[:CHAINED_TO*]->(root:Block{chain_id:"' + chainId + '"}) ' +
        'WHERE NOT (root)-[:CHAINED_TO]->() AND NOT ()-[:CHAINED_TO]->(leaf) ' +
        'RETURN path ' +
        'LIMIT 1'
}

const getActivesChainNodesBlocksQuery = (chainId) => {
    return 'MATCH (b:Block{chain_id:"' + chainId + '"}),' +
        '(b)-[:HOSTED_BY]->(h:Host{active:' + HostStatusEnum.ACTIVE.valueOf().toString() + '})' +
        'RETURN b.block_index AS block_index, elementId(b) AS id, h.name AS hostname'
}



exports.getNodeFindAllQuery = getNodeFindAllQuery
exports.getNodeInsertOneQuery = getNodeInsertOneQuery
exports.getNodeUpdateQuery = getNodeUpdateQuery
exports.getNodeDeleteQuery = getNodeDeleteQuery
exports.getNodeFindByIdQuery = getNodeFindByIdQuery
exports.parseNodesResult = parseNodesResult
exports.parseNodeResult = parseNodeResult
exports.getRelationFindAllQuery = getRelationFindAllQuery
exports.getRelationInsertOneQuery = getRelationInsertOneQuery
exports.getRelationUpdateQuery = getRelationUpdateQuery
exports.getRelationDeleteQuery = getRelationDeleteQuery
exports.getRelationFindByIdQuery = getRelationFindByIdQuery
exports.parseRelationsResult = parseRelationsResult
exports.parseRelationResult = parseRelationResult
exports.getNodeFindByKeysValuesQuery = getNodeFindByKeysValuesQuery
exports.getLeafBlockNodeQuery = getLeafBlockNodeQuery
exports.getChainNodes = getChainNodes
exports.getActivesChainNodesBlocksQuery = getActivesChainNodesBlocksQuery
exports.parseRequestResult = parseRequestResult