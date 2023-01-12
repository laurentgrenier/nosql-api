CREATE (p1:Person{name:"Fabio Ochoa", firstname:"Fabio",lastname:"Ochoa"}),
  (p2:Person{name:"Jorge Luis Ochoa", firstname:"Jorge Luis",lastname:"Ochoa"}),
  (p3:Person{name:"Patrick Marsoulas", firstname:"Patrick",lastname:"Marsoulas"})
RETURN p1,p2,p3;

MATCH (p1:Person{name:"Patrick Marsoulas"}) DELETE p1;

match 
    (cr:Crew{nickname:"Strawhats"}), (ch2:Character{firstname="Zoro"}),
    (ch3:Character{firstname="Nami"}),(ch4:Character{firstname="Usopp"}), (ch5:Character{firstname:"Sanji"}), 
    (ch2)-[r2:MEMBER_OF]->(cr),(ch3)-[r3:MEMBER_OF]->(cr),(ch4)-[r4:MEMBER_OF]->(cr),(ch5)-[r5:MEMBER_OF]->(cr)

set r2.order=2,r3.order=3,r4.order=4,r5.order=5