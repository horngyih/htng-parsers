var fs = require("fs");
var ReadLine = require("readline");

var xmljs = require("xml-js");

var targetFile = process.argv.slice(2)[0];

var lineReader = ReadLine.createInterface( { input : fs.createReadStream(targetFile) } );
lineReader.on( "line", processLine );
lineReader.on( "close", finalize );

var parsedObjects = [];

function processLine( line ){
    var xmlObj = xmljs.xml2json(line,{compact:true, spaces:4});
    parsedObjects.push(xmlObj);
}

function finalize(){
    console.log( "[" );
    console.log(parsedObjects.join(","));
    console.log( "]" );
    process.exit(0);
}
