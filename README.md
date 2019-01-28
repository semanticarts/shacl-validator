# shacl-validator
Node.js SHACL Valdiator

## How to Use

1. Clone into local directory
2. Run `npm install` in project directory to install dependencies
3. Run `npm link` to install runnable script
4. Invoke validator, e.g. `validate-shacl -d @test/data.ttl -s @test/shapes.ttl`

## Command Line Options

|                       |                                                                               |                        
|-----------------------|-------------------------------------------------------------------------------|
| *-e*, *--endpoint* _URL_    | The URL for a SPARQL endpoint used to access named graphs or run queries.     
|                       |   Must be specified unless local files are used for both data and shapes.       
|  *-s*, *--shapes* _location_ |   The location of the SHACL shapes. If specified as _@file_, shapes will be read  
|                         | from a local Turtle file. If specified as  _\<graph>_, the named graph will be   
|                         | retrieved from the SPARQL endpoint. Otherwise, the actual argument is         
|                         | interpreted as Turtle shapes.                                                 
|  *-d*, *--data* _location_  |   The location of the data to be validated. If specified as _@file_, data will be 
|                       |   read from a local Turtle file. If specified as  _\<graph>_, the named graph      
|                       |   will be retrieved from the SPARQL endpoint. Otherwise, the actual argument is 
|                       |   interpreted as Turtle data. Cannot be specified if *--query* is provided.       
|  *-q*, *--query* _query_    |   Query to retrieve the data to be validated. If specified as _@file_, query will 
|                       |   be read from a local file.  Otherwise, the actual argument is interpreted as  
|                       |   SPARQL query. Cannot be specified if *--data* is provided.                      
|  --help               |   Print this usage guide.    