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
const getChainsNodesWithoutChild = (name, chainId) => {
    return 'MATCH (x) WHERE NOT ()-[:' + name  + ']->(x) and a.chain_id = "' + chainId + '" return x'
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