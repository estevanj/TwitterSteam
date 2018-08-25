# TwitterSteam
Big Data en Neo4J y Twitter, Para obtener tendencias según criterios Definidos
-----------------------------------------------------------
*****Inicializacion Servidor Neo4j--------------------------
-----------------------------------------------------------
#Descomprimir el zip neo4j-community-3.3.2-windows.zip
#ubicar en el C:// del sistema
#Abrir una terminal (CMD)
#Ingresar los siguientes Comandos
->cd  C:\neo4j-community-3.3.2\
->bin\neo4j console
#Para parar el servidor poner
->Ctrl + C
# Ingresar al localhost:7474
# Para el cambio de clave poner la siguente: admin

-----------------------------------------------------------
*****Instalación y ejecución de Contenedores Docker--------
-----------------------------------------------------------

-------------Descarga de las Imagenenes acoplables--------

-> docker pull sequenceiq/hadoop-docker:2.4.1
-> docker pull kbastani/docker-neo4j:2.2.1
-> docker pull kbastani/neo4j-graph-analytics:1.1.0


------------Ejecucion Contenedores -----------------------
# Crear HDFS
-> docker run -i -t --name hdfs sequenceiq/hadoop-docker:2.4.1 /etc/bootstrap.sh -bash

# Crear servicio Mazerunner Apache Spark
-> docker run -i -t --name mazerunner --link hdfs:hdfs kbastani/neo4j-graph-analytics:1.1.0

# Crear Base de datos Neo4j con links a HDFS y Mazerunner
-> docker run -d -P -v C:/neo4j-community-3.3.2/data/databases/graph.db/data:/opt/data --name graphdb --link mazerunner:mazerunner --link hdfs:hdfs kbastani/docker-neo4j:2.2.1


----------Cancelar ejecucion de Contenedores------------
-> docker stop $(docker ps -a -q)
-> docker rm $(docker ps -a -q)


-----------------------------------------------------------
*****Ejecucion Aplicacion Java para realzar el Stream-----
-----------------------------------------------------------
#Abrir un terminal (Cmd)
#Ingresa los siguientes Comandos

-> cd C:/servidortwiter/StreamTwitterUte/dist
-> java -jar StreamTwitterUte.jar


-----------------------------------------------------------
*****Consultas Cryper para Neo4j---------------------------
-----------------------------------------------------------

# Numero de relaciones obtenidas
-> MATCH (n)-[r]->() RETURN COUNT(r)

# Numero de tweets por hashtag
-> MATCH (Tag)-[:TAGGED] ->(Tweet)   RETURN Tweet as hashtag, count(Tweet) as tweets  ORDER  BY  tweets  DESC  LIMIT  10

# Filtro de personas por hastag
-> MATCH (Tag { name: 'poner hastag aqui' })--(Tweet)--(n:User) WHERE EXISTS(n.screen_name) RETURN DISTINCT "node" as entity, n.screen_name AS screen_name LIMIT 25


-----------------------------------------------------------
*****Inicializacion Servidor para el envio de Emails-------
-----------------------------------------------------------
#Ingresar al directorio
C:/servidortwiter
#Ejecutar el archivo stream.bat
#Abrir en el browser la página localhost:8080
#Los archivos .csv descargados se deben colocar en la siguiente direccion
C:/servidortwiter/CSV/
