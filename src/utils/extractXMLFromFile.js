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
    return new Promise(function(resolve,reject){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(targetfile)});
        var logfileCompactor = new LogFileCompactor();
        lineReader.on("line",logfileCompactor.parse);
        lineReader.on("close",function(){ resolve(parseLogFile(logfileCompactor.parsed()));});
    });
}

function parseLogFile(content){
    if(content){
        var log4JEventParser = new Log4JEventParser();
        var xmljsons = content
        .map(function(line){
            try{
                var event = log4JEventParser.parse(line);
                if( event && event.data ){
                    var xml = extractXML( event.data );
                    if( xml ){
                        return JSON.parse(XMLJS.xml2json(xml,{compact:true}));
                    }
                }
            } catch( error ){
                console.log( "Line : " , line );
                console.log( "Error : ", error );
            }
        })
        .filter(function(item){return item;})
        .reduce(function(map, json){
            map = map || {};
            var elementType = Object.keys(json)[0];
            var elementArray = map[elementType];
            if( !elementArray ){
                elementArray = [];
            }
            elementArray.push(json);
            map[elementType] = elementArray;
            return map;
        },{});

        console.log( xmljsons.SpecialRequests[0].SpecialRequests.SpecialRequest );
    }
}
