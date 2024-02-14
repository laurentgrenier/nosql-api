# nosql-api
NoSQL NodeJS api 

> WARNING:
> That API doesn't content the whole content of the "TPs". That's just a part of it.

## Usage
### Prerequisites
* nodes packages must be installed: ```npm install```
* neo4j server must be started
* mongo server must be started 
* redis server must be started
* *data* folder must be created (blockchain)

> The current ```.env``` file assume that 
> * redis is exposed on port 6379
> * mongo is exposed on port 37017
> * neo4j is exposed on port 7687
>
> Depending on your installation, ports mapping could be different.

### Start the API
```shell
npm start
````

## Blockchain
### Installation
```shell
# url refer to the .env variable BLOCKCHAIN_EMULATION_FOLDER
mkdir data
```

Do not forget to add that folder to the .gitignore file. Data must not be stored to any repository.


### Start the databases
#### REDIS
```shell
docker pull redis:7.0.4-bullseye
```
```shell
docker run --restart always \
    -p 36379:6379 \
    --name myredis \
    -d redis:7.0.4-bullseye
```

#### Neo4J
```shell
docker run --restart always \
    --name myneo4j \
    -p7474:7474 -p7687:7687 -e NEO4J_AUTH=neo4j/s3cr3tio \
    --volume=/Users/laurent/workspaces/mooke/data/neo4j:/data \
    -d neo4j
```

#### MongoDB
```shell
docker run --restart always \
    -p 37017:27017 -v mongodata:/data/db \
    --name mymongo \
    -d mongo:4.2.3-bionic
```


