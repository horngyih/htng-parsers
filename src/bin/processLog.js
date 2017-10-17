/* jshint esversion:6 */
const fs = require("fs");
const path = require( "path" );
const program = require("commander");
const xmljs = require("xml-js");
const moment = require("moment");

const ReadLine = require("readline");
const LogFileCompactor = require(path.resolve(__dirname,"..","utils","logFileCompactor"));
const Log4JEventParser = require(path.resolve(__dirname,"..","utils","log4jEventParser"));
const extractXML = require( path.resolve(__dirname,"..","utils","xmlExtractor"));

const processingUtil = require( path.resolve(__dirname,"..","utils","processingUtils"));

const availNotif = require( path.resolve(__dirname,"..","messages","otaHotelAvailNotifRQ"));

const package = require( path.resolve("package.json"));
program
.version(package.version)
.usage( "[options] <filename> <messageType>")
.arguments("<filename> <messageType>")
.option( "-p, --propertyCode <value>", "Filter by propertyCode" )
.option( "-f, --from <value>", "Message sent after this timestamp", moment )
.option( "-t, --to <value>", "Message sent before this timestamp", moment )
.action(function(filename, messageType ){
    processLogs(filename, messageType );
})
.parse(process.argv);

function processLogs(filename, messageType ){
    console.log( "Reading from file ", filename );
    console.log( "Message Type ", messageType );
    console.log( "Property Code", program.propertyCode );
    console.log( "From ", program.from );
    console.log( "To ", program.to );
     var processor = processor || printOut;
    extract(filename)
    .then(parseEvents)
    .then(processEvents)
    .then(collateMessages)
    .then(processTargetMessageType.bind({messageType:messageType}))
    .then(processor);
}

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
            .map(function(json){if(json){ return extractXML(json.data,{compact:true, spaces:2});}})
            .filter((item)=>item);
            resolve(xmljsons);
        } else {
            resolve([]);
        }            
    });
}

function collateMessages(xmljsons){
    return new Promise(function(resolve,reject){
        if(xmljsons){
            if( Array.isArray(xmljsons)){
                resolve(xmljsons.reduce(function(map,xmljs){
                    map = map || {};
                    if(xmljs){
                        var keys = Object.keys(xmljs);
                        var key = keys[0];
                        var bucket = map[key] || [];
                        bucket.push(xmljs);
                        map[key] = bucket;
                    }
                    return map;
                },{}));
            } else {
                resolve( xmljsons);
            }
        } else {
            resolve([]);
        }
    });
}

function processTargetMessageType(result){
    return new Promise(function(resolve,reject){
        var targetMessages = result["OTA_HotelAvailNotifRQ"];
        var parsed = targetMessages.map(availNotif.flattenOTAHotelAvailNotifRQ).reduce(processingUtil.flatten,[]);
        resolve(parsed);
    });
}

function printOut(result){
    if( Array.isArray(result) ){
        if( result.length > 0 ){
            var sample = result[0];
            var keys = Object.keys(sample);
            var line = "";
            for( var i in keys ){
                var key = keys[i];
                line+= key;
                if( i < keys.length ){
                    line += "|";
                }                
            }
            console.log(line);
        }
        result.forEach(function(item){
            var keys = Object.keys(item);
            var line = "";
            for( var i in keys ){
                var key = keys[i];
                line += item[key];
                if( i < keys.length ){
                    line += "|";
                }
            }
            console.log(line);
        });
    } else {
        for( var key in result ){
            console.log(key);
            console.log(JSON.stringify(result[key]));
        }
    }
}