/* jshint esversion:6 */
const fs = require("fs");
const path = require( "path" );
const program = require("commander");
const xmljs = require("xml-js");

const ReadLine = require("readline");
const LogFileCompactor = require(path.resolve(__dirname,"..","utils","logFileCompactor"));
const Log4JEventParser = require(path.resolve(__dirname,"..","utils","log4jEventParser"));
const extractXML = require( path.resolve(__dirname,"..","utils","xmlExtractor"));

const package = require( path.resolve("package.json"));
program
.version(package.version)
.usage( "[options] <filename>")
.arguments("<filename>")
.action(function(filename){
     var processor = processor || printXMLs;
    extract(filename)
    .then(parseEvents)
    .then(processEvents)
    .then(processor);
})
.parse(process.argv);

function extract(filename){
    return new Promise(function(resolve, reject){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(filename)});
        var logFileCompactor = new LogFileCompactor();
        lineReader.on("line", logFileCompactor.parse);
        lineReader.on("close", function(){resolve(logFileCompactor.parsed());});
    });
}

function parseEvents(lines){
    return new Promise(function(resolve,reject){
        if( lines ){
            var log4JEventParser = new Log4JEventParser();
            var events = lines.map(log4JEventParser.parse);
            resolve(events);
        } else {
            resolve([]);
        }
    });
}

function processEvents(events){
    return new Promise(function(resolve,reject){
        if( events ){
            var xmljsons = events
            .map(function(json){if(json){ return extractXML(json.data,{compact:true,spaces:2});}})
            .filter((item)=>item);
            resolve(xmljsons);
        } else {
            resolve([]);
        }            
    });
}

function printXMLs(xmljsons){
    if( Array.isArray(xmljsons) ){
        console.log("[");
        var count = 0;
        xmljsons.forEach(function(xmljson){
            var delimeter = "";
            count++;
            if( count < xmljsons.length ){
                delimiter = ",";
            }
           console.log(xmljson+delimiter);
        });
        console.log("]");
    }
}