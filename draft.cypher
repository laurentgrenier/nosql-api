CREATE (u1:User{name:"Alpha", age:"22",email:"alpha@gmail.com"}),  
(u2:User{name:"Beta", age:"23",email:"beta@gmail.com"}),  
(u3:User{name:"Gama", age:"28",email:"gama@gmail.com"}),  
(u4:User{name:"Delta", age:"34",email:"delta@gmail.com"}),  
(u5:User{name:"Epsilon", age:"30",email:"epsilon@gmail.com"})  
RETURN u1, u2, u3, u4, u5;

CREATE (a1:Article{ref:"a1",content:"Climat : la couche d'ozone en bonne voie pour se reconstituer", sentiment:"positive"}),  
(a2:Article{ref:"a2", content:"Tarn-et-Garonne : le réchauffement climatique pèse déjà lourd sur ...", sentiment:"negative"}),
(a3:Article{ref:"a3", content:"Climat : le trou dans la couche d'ozone pourrait se résorber d'ici à 2066", sentiment:"positive"}),
(a4:Article{ref:"a4", content:"Réchauffement climatique : après les canicules estivales, il faudra s'habituer aux chaleurs hivernales", sentiment:"negative"})
RETURN a1, a2, a3,a4;

CREATE (e1:Editor{name:"Figaro", political:"right"}),  
(e2:Editor{name:"La Voix du Nord", political:"left"}),  
(e3:Editor{name:"TF1", political:"right"}),
(e4:Editor{name:"La dépêche", political:"left"})
RETURN e1, e2, e3, e4;

// write relation 
MATCH (e1:Editor{name:"Figaro"}), 
  (e2:Editor{name:"La dépêche"}),
  (e3:Editor{name:"TF1"}),
  (e4:Editor{name:"La Voix du Nord"}),
  (a1:Article{ref:"a1"}),
  (a2:Article{ref:"a2"}),
  (a3:Article{ref:"a3"}),
  (a4:Article{ref:"a4"})
CREATE (e1)-[w1:WRITES]->(a1),
  (e2)-[w2:WRITES]->(a2),
  (e3)-[w3:WRITES]->(a3),
  (e4)-[w4:WRITES]->(a4)
RETURN e1,e2,e3,e4,a1,a2,a3,a4;

MATCH (e:Editor), (a:Article) RETURN e,a;

MATCH ()-[r:WRITES]->() DELETE r;
MATCH ()-[r:WRITES]->() DELETE r;
MATCH (n) DELETE n;

MATCH (e1:Editor{name:"Figaro"}),(a1:Article{ref:"a3"}) CREATE (e1)-[w1:WRITES{by:"John Papa"}]->(a1) RETURN e1,a1;


// /4:192ffc8d-e40b-40ce-807a-9667c6f7c5a5:4/4:192ffc8d-e40b-40ce-807a-9667c6f7c5a5:8
MATCH (source:Editor),(target:Article) WHERE elementId(source) = "4:00c090c6-4c9a-4170-9106-85484617ba31:6" AND elementId(target) = "4:00c090c6-4c9a-4170-9106-85484617ba31:0" CREATE (source)-[x:WRITES{by:"Claire Chazal"}]->(target) RETURN x