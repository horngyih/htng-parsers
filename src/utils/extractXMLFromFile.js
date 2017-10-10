/* jshint esversion:6 */

const fs = require("fs");
const path = require("path");

const ReadLine = require("readline");
const XMLJS = require("xml-js");

const LogFileCompactor = require("./logFileCompactor");
const Log4JEventParser = require("./log4jEventParser");

const extractXML = require("./xmlExtractor");

const args = process.argv.slice(2);

if( args.length ){
    readFile(path.resolve(process.cwd(),args[0]));
} else {
    showUsage();
}

function showUsage(){
    console.log( "Usage : extractXMLFromFile <filename>");
    process.exit(0);
}

function readFile(targetfile){
    var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetfile)});
    var logfileCompactor = new LogFileCompactor();
    lineReader.on("line",logfileCompactor.parse);
    lineReader.on("close",function(){parseLogFile(logfileCompactor.parsed());});
}

function parseLogFile(content){
    if(content){
        var log4JEventParser = new Log4JEventParser();
        var xmljsons = content
        .map(function(line){
            var xml = extractXML( log4JEventParser.parse(line).data );
            if( xml ){
                return XMLJS.xml2json(xml,{compact:true});
            }
        })
        .filter(function(item){return item;});
        console.log(xmljsons);
    }
}
