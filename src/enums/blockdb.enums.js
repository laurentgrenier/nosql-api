const HostStatusEnum = Object.freeze({
    ACTIVE:1,
    OFFLINE:0,
    DELETED:2
})

const GraphNodeClassEnum = Object.freeze({
    BLOCK:"Block",
    HOST:"Host",
    BLOCKCHAIN:"Blockchain",
    CLUSTER:"Cluster"
})

const GraphRelationClassEnum = Object.freeze({
    COPY_OF:"COPY_OF",
    CHAINED_TO:"CHAINED_TO",
    HOSTED_BY:"HOSTED_BY",
    PART_OF:"PART_OF",
    ROOT_OF:"ROOT_OF"
})


const BlockchainTypeEnum = Object.freeze({
    CUMULATIVE_RECORD:"cumulative_record",
    SERIES:"series",
    VERSIONED_RECORD:"versioned_record"

})


exports.HostStatusEnum = HostStatusEnum
exports.GraphNodeClassEnum = GraphNodeClassEnum
exports.GraphRelationClassEnum = GraphRelationClassEnum
exports.BlockchainTypeEnum = BlockchainTypeEnum