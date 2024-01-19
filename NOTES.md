
```sql
LOAD CSV WITH HEADERS FROM "file:///neo4j.csv" AS line
WITH line
MERGE (Perpetrator:Character{name:line.Perpetrator, house:line.PerpHouse})
MERGE (Victim:Character{name:line.Victim, house:line.VictimHouse})
MERGE (Perpetrator)-[betrayal:Betrayal{
`Betrayal Description`:line.Betrayal, 
`Relationship perp-victim`:line.`Relationship Perp-Victim`, 
`Immediate Consequence`: CASE WHEN line.`Immediate Consequence` IS NOT NULL THEN line.`Immediate Consequence`
 ELSE '' END,
Location: CASE WHEN line.Geography IS NOT NULL THEN line.Geography ELSE '' END
}]->(Victim)
```

```sql
LOAD CSV WITH HEADERS FROM "file:///campaign_neo4j.csv" AS line
WITH line
MERGE (OriginUser:User{pseudo:line.OriginPseudo})
MERGE (TargetUser:User{pseudo:line.TargetPseudo})
MERGE (OriginUser)-[interaction:Interaction{
Sentiment:toFloat(line.Sentiment), 
Approbation:toFloat(line.Approbation), 
Message:CASE WHEN line.Message IS NOT NULL THEN line.Message ELSE '' END,
Retweet:CASE WHEN line.Retweet IS NOT NULL THEN true ELSE false END
}]->(TargetUser)
```



```shell
# copy the file into the import folder of the neo4j docker container
docker cp neo4j.csv 26bdf5bc171b:/var/lib/neo4j/import/neo4j.csv
docker cp campaign_neo4j.csv 26bdf5bc171b:/var/lib/neo4j/import/campaign_neo4j.csv

# import the file
cat import\all.cypher | .\bin\cypher-shell.bat -u neo4j -p pwd

```

```sql
MATCH u=(u2:User)-[Interaction*1..4]->(u1:User{pseudo:'PoliticMan'}) return u

match (u1:User)-[i1:Interaction]->(u2:User)-[i2:Interaction]->(u3:User)-[i3:Interaction]->(u4:User{pseudo:'PoliticMan'}) return u1
/* get pseudo of users of rank 3 */
match p = (u1:User)-[*]->(:User {pseudo:'PoliticMan'}) WHERE length(p) = 3 RETURN u1.pseudo

/* compute approbation of rank 3 */
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'PoliticMan'}) WHERE length(p) = 3 RETURN reduce(total=1.0, x  in i | x.Approbation * total)


match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'sharity'}) WHERE length(p) = 3 AND reduce(total=1.0, x  in i | x.Approbation * total) > 0.6RETURN count(u1)

/* count users by relation rank */
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'sharity'}) WHERE length(p) = 1 RETURN count(u1)
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'sharity'}) WHERE length(p) = 2 RETURN count(u1)
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'sharity'}) WHERE length(p) = 3 RETURN count(u1)


/* compute  */
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'sharity'}) WHERE length(p) = 3 AND reduce(total=1.0, x  in i | x.Approbation * total) > 0.5 RETURN count(u1)


/* count users by relation rank */
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'jeniece'}) WHERE length(p) = 1 RETURN count(u1)
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'jeniece'}) WHERE length(p) = 2 RETURN count(u1)
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'jeniece'}) WHERE length(p) = 3 RETURN count(u1)


/* compute  */
match p = (u1:User)-[i:Interaction*]->(:User {pseudo:'jeniece'}) WHERE length(p) = 3 AND reduce(total=1.0, x  in i | x.Approbation * total) > 0.5 RETURN count(u1)

/* delete all */
MATCH (n) DETACH DELETE n

```
(s2:Server{name:"New York"}),
(s4:Server{name:"Frankfurt"}),
(s3:Server{name:"Dublin"}),

Dans ce TP, vous allez voir appliquer quelques méthodes de la théorie des graphes sur une base de données orientée graphe.  


1. Créez le graphe du réseau suivant: 
```sql
CREATE (s1:Server{name:"San Francisco"}),  
  (s2:Server{name:"Paris"}),
  (s3:Server{name:"Tokyo"}),
  (s1)-[l1:OpticalFiber{speed:4000}]->(s2),
  (s2)-[l2:OpticalFiber{speed:8000}]->(s3)
RETURN s1,s2,s3,l1,l2
```

2. Calculez le débit moyen de la relation  entre San Francisco et Tokyo en additionnant les débit des différents liens et divisant par leur nombre:
```sql
MATCH servers = (:Server{name:"San Francisco"})-[netlinks:OpticalFiber*]->(:Server{name:"Tokyo"}) 
RETURN reduce(total=0.0, netlink in netlinks | netlink.speed + total) / size(netlinks)
```
MATCH (n) return n
3. Calculez le débit moyen dans le sens inverse, de Tokyo à San Francisco. 
```sql
MATCH servers = (:Server{name:"Tokyo"})-[netlinks:OpticalFiber*]->(:Server{name:"San Francisco"}) 
RETURN reduce(total=0.0, netlink in netlinks | netlink.speed + total) / size(netlinks)
```

Quel est le résultat ? 
Neo4J est une base de données graphe directionnelle. Cela signifie que les relations sont dirigées. Il n'y a pas de relation de Tokyo vers San Francisco.

4. Créez un lien internet fibre entre Tokyo et Paris avec un débit de 2000 et entre Paris en San Francisco avec un débit de  4000.
```sql
MERGE (s1:Server{name:"San Francisco"})  
MERGE (s2:Server{name:"Paris"})
MERGE (s3:Server{name:"Tokyo"})
MERGE (s3)-[l1:OpticalFiber{speed:2000}]->(s2)
MERGE (s2)-[l2:OpticalFiber{speed:4000}]->(s1)
RETURN s1,s2,s3,l1,l2
```

5. Effectuez à nouveau le calcul de débit de Tokyo à San Francisco

6. Ajoutez trois nouvelles liaisons internet 
    * une liaison, bi-directionnelle, ADSL entre New York et San Francisco avec un débit de 300
    * une liaison, bi-directionnelle, fibre optique entre New York et Dublin avec un débit de 4000
    * une liaison, uni-directionnelle, fibre optique entre Dublin et Paris avec un débit de 6000
    * une liaison, uni-directionnelle, ADSL entre Frankfurt et Dublin avec un débit de 200
    * une liaison, uni-directionnelle, fibre optique entre Frankfurt et Tokyo avec un débit de 4000
 
```sql
MERGE (s1:Server{name:"San Francisco"})  
MERGE (s2:Server{name:"Paris"})
MERGE (s3:Server{name:"Tokyo"})
MERGE (s4:Server{name:"New York"})  
MERGE (s5:Server{name:"Dublin"})
MERGE (s6:Server{name:"Frankfurt"})
MERGE (s1)-[l1:ADSL{speed:300}]->(s4)
MERGE (s4)-[l2:ADSL{speed:300}]->(s1)
MERGE (s4)-[l3:OpticalFiber{speed:4000}]->(s5)
MERGE (s5)-[l4:OpticalFiber{speed:4000}]->(s4)
MERGE (s2)-[l5:OpticalFiber{speed:6000}]->(s5)
MERGE (s5)-[l6:ADSL{speed:200}]->(s6)
MERGE (s6)-[l7:OpticalFiber{speed:4000}]->(s3)
RETURN s1,s2,s3,s4,s5,s6
```

Supprimez la liaison de Paris vers Tokyo 
```sql
MATCH (s1:Server{name:"Paris"})-[l]->(s4:Server{name:"Tokyo"})  
DELETE l
MATCH (s1:Server{name:"Paris"})-[l]->(s4:Server{name:"San Francisco"})  
DELETE l
```

Trouvez le chemin pour aller de Tokyo à San Francisco en 4 étapes 
```sql
MATCH servers = (:Server{name:"Tokyo"})-[*]->(:Server{name:"San Francisco"})
WHERE length(servers) = 4
WITH nodes(servers) as res
RETURN [n IN res | n.name] 
```

Recherchez le chemin inverse en 4 étapes
```sql
MATCH servers = (:Server{name:"San Francisco"})-[*]->(:Server{name:"Tokyo"})
WHERE length(servers) = 4
WITH nodes(servers) as res
RETURN [n IN res | n.name] 
```


Trouvez le plus court chemin en nombre d'étapes de New York à Tokyo.
```sql
MATCH (s1:Server{name:"New York"}),
  (s2:Server{name:"Tokyo"}),
  p = shortestPath((s1)-[*]->(s2))
WITH relationships(p) as links
RETURN reduce(total=0.0, link in links | link.speed + total) / length(link)
```

Trouvez le débit minimal et le débit maximal entre 
```sql
MATCH servers = (:Server{name:"New York"})-[*]->(:Server{name:"Tokyo"})
WITH relationships(servers) as netlinks
WITH AVG(reduce(total=0.0, netlink in netlinks | netlink.speed + total)) as speeds
RETURN max(speeds) AS max_speed, min(speeds) AS min_speed
```

Exécutez la requête suivante pour trouver le chemin le plus rapide de New York à Tokyo.
```sql
MATCH paths = (:Server{name:"New York"})-[*]->(:Server{name:"Tokyo"})
WITH nodes(paths) as servers, relationships(paths) as netlinks
WITH servers, [n IN netlinks | toFloat(n.speed)] AS speeds
UNWIND speeds AS speed
WITH [server IN servers | server.name] AS servers_locations, min(speed) AS min_speed
RETURN servers_locations, min_speed 
```

Modifiez la requête précédente pour indiquer le chemin le plus rapide de Tokyo à San Francisco. 
Envoyez votre requête et le résultat par tchat privé sur Teams. 


MATCH servers = (:Server{name:"San Francisco"})-[netlinks:OpticalFiber*]->(:Server{name:"Tokyo"}) 
RETURN reduce(total=0.0, netlink in netlinks | netlink.speed + total) / size(netlinks)


MATCH path=(leaf:Block{chain_id:"wzy63w0diihu77xb"})-[:CHAINED_TO*]->(root:Block{chain_id:"wzy63w0diihu77xb"})
WHERE NOT (root)-[:CHAINED_TO]->() AND NOT ()-[:CHAINED_TO]->(leaf)
WITH path,nodes(path) AS nodes
MATCH (block:Block)-[:HOSTED_BY]->(host:Host) WHERE elementId(block) IN [n IN nodes | elementId(n)]
RETURN DISTINCT host, block


MATCH (b:Block{chain_id:"wzy63w0diihu77xb"}),
    (b)-[:HOSTED_BY]->(host:Host{active:1})
RETURN DISTINCT b.block_id, max(elementId(b))

MATCH (b:Block{chain_id:"wzy63w0diihu77xb"}),
    (b)-[:HOSTED_BY]->(h:Host{active:1})
RETURN b.block_id AS block_id, elementId(b) AS id, h.name AS host_name

MATCH (b:Block{chain_id:"72drtw7ujsca9dbl"}),
  (b)-[:HOSTED_BY]->(h:Host{active:1})
RETURN b.block_index AS block_index, elementId(b) AS id, h.name AS hostname

