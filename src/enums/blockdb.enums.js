const HostStatusEnum = Object.freeze({
    ACTIVE:1,
    OFFLINE:0,
    DELETED:2
})

const GraphNodeClassEnum = Object.freeze({
    BLOCK:"Block",
    HOST:"Host"
})

const GraphRelationClassEnum = Object.freeze({
    COPY_OF:"COPY_OF",
    CHAINED_TO:"CHAINED_TO",
    HOSTED_BY:"HOSTED_BY"
})


exports.HostStatusEnum = HostStatusEnum
exports.GraphNodeClassEnum = GraphNodeClassEnum
exports.GraphRelationClassEnum = GraphRelationClassEnum