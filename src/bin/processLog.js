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
const ratePlanNotif = require( path.resolve(__dirname,"..","messages","otaHotelRatePlanNotifRQ"));

const messageTypes = {
    OTA_HotelAvailNotifRQ : {
        flat : availNotif.flattenOTAHotelAvailNotifRQ,
        parse : availNotif.parseOTAHotelAvailNotifRQ
    },
    OTA_HotelRatePlanNotifRQ : {
        flat : ratePlanNotif.flattenOTAHotelRatePlanNotifRQ,
        parse : ratePlanNotif.parseOTAHotelAvailNotifRQ
    },
    OTA_HotelResNotifRQ : {
        flat : function(item){return item}, //Dummy flat parser
        parse : function(item){return item} //Dummy parse
    }
}

const package = require( path.resolve("package.json"));
program
.version(package.version)
.usage( "[options] <filename>")
.arguments("<filename...>")
.option( "-d, --delimiter <value>", "Output delimiter" )
.option( "-p, --propertyCode <value>", "Filter by propertyCode" )
.option( "--rateCode <value>", "Filter by Rate Plan Code" )
.option( "--roomType <value>", "Filter by Room Type Code" )
.option( "-m, --message <value>", "Filter for Message Type" )
.option( "-f, --from <value>", "Message sent after this timestamp", moment )
.option( "-t, --to <value>", "Message sent before this timestamp", moment )
.option( "--parallel", "Process file in parallel" )
.action(function(filename, messageType ){
    processLogs(filename, messageType );
})
.parse(process.argv);

function processLogs(files, messageType ){
    var targetFiles = [];
    if( files ){
        targetFiles = targetFiles.concat(files);
        targetFiles.forEach(function(file){
            if( program.parallel ){
                console.log( "PARALLEL" );
                processLogFileParallel(file, messageType);
            } else {
                processLogFile(file, messageType);
            }
        });
    }
}

function processLogFile(filename, messageType){
    printExecutionHeader(filename);
     var processor = processor || printOut;
    extract(filename)
    .then(parseEvents)
    .then(filterEvents)
    .then(processEvents)
    .then(collateMessages)
    .then(processTargetMessageType)
    .then(filterMessages)
    .then(processor)
    .then(function(){
        console.log( "DONE - ", filename );
    })
    .catch(handleError);
}

function processLogFileParallel(filename, messageType){
    return new Promise(function(resolve, reject){
        printExecutionHeader(filename);
        var processor = processor || printOut;

        function header(){
            suppressHeader = false;
            return function(result){
                return new Promise(function(resolve,reject){
                    if( !suppressHeader ){
                        if( result && result.length > 0 ){
                            printHeader(result[0]);
                            suppressHeader = true;
                        }
                    }
                    resolve(result);
                });
            };
        }

        var headerPrinter = header();
        function processLine(line){
            var result = [];
            if( line ){
                result = result.concat(line);
                parseEvents(result)
                .then(filterEvents)
                .then(processEvents)
                .then(collateMessages)
                .then(processTargetMessageType)
                .then(filterMessages)
                .then(headerPrinter)
                .then(processor)
                .then(resolve);
            } else {
                resolve();
            }
        }
        extract(filename, processLine );
    });
}

function extract(filename, lineProcessor){
    return new Promise(function(resolve, reject){
        var lineReader = ReadLine.createInterface({input: fs.createReadStream(filename)});
        var logFileCompactor = new LogFileCompactor();
        if( typeof lineProcessor === "function" ){
            logFileCompactor.on("line", lineProcessor);
        }
        lineReader.on("line", logFileCompactor.parse);
        lineReader.on("close", function(){
            logFileCompactor.close();
            resolve(logFileCompactor.parsed());
        });
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

function filterEvents(events){
    return new Promise(function(resolve,reject){
        if( Array.isArray(events) ){
            resolve(events.filter(function(event){
                var eventTimestamp = (event.timestamp)?moment(event.timestamp,"MM-DD hh:mm:ss" ):null;
                if( eventTimestamp ){
                    if( program.to && program.from ){
                        return eventTimestamp.isBetween( program.to, program.from, null, "[]" );
                    } else if( program.to) {
                        return eventTimestamp.isSameOrBefore(program.to);
                    } else if( program.from ){
                        return eventTimestamp.isSameOrAfter(program.from);
                    }
                }
                return true;
            }));
        }
        resolve(events);        
    });
}

function filterMessages(messages){
    return new Promise(function(resolve,reject){
        if( Array.isArray(messages) ){
            if( program.propertyCode || program.rateCode || program.roomType ){
                resolve(messages.filter(function(message){
                    var result = true;
                    if( program.propertyCode ){
                        result &= message.propertyCode === program.propertyCode;
                    }
    
                    if( program.rateCode ){
                        result &= message.rate === program.rateCode;
                    }
    
                    if( program.roomType ){
                        result &= message.roomType === program.roomType;
                    }
                    return result;
                }));
            } else {
                resolve(messages);
            }
        } else {
            resolve(messages);
        }
    });
}

function collateMessages(xmljsons){
    return new Promise(function(resolve,reject){
        if(xmljsons){
            if( Array.isArray(xmljsons) && xmljsons.length > 0 ){
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
        var messageType = "OTA_HotelAvailNotifRQ";
        if( program.message ){
            messageType = mapMessageType(program.message);
        }
        var targetMessages = result[messageType];
        if( targetMessages ){
            var parser = messageTypes[messageType].flat;
            if( typeof parser !== "function" ){
                parser = function(item){ return item; };
            }
            var parsed = targetMessages.map(parser).reduce(processingUtil.flatten,[]);
            resolve(parsed);
        } else {
            if( program.parallel ){
                resolve([]);
            } else {
                resolve(result);
            }
        }
    });
}

function printOut(result){
    if( result ){
        if( Array.isArray(result) ){
            printArray(result);
        } else {
            for( var key in result ){
                console.log(key);
                if( Array.isArray(result) ){
                    printArray(result);
                } else {
                    console.log(JSON.stringify(result[key]));
                }
            }
        }
    }
}

function printArray(result){
    if( result.length > 0 ){
        var sample = result[0];
        if( program.parallel === false ){
            printHeader(sample);
        }
        result.forEach(printData);
    } else {
        if( !program.parallel ){
            console.log( "No results found" );
        }
    }
}

function printExecutionHeader(file){
    var executionHeader = "";
    if( file ){
        executionHeader += "File:";
        executionHeader += file;
    }

    if( program.message ){
        executionHeader += "-";
        executionHeader += mapMessageType(program.message);
    }

    if( moment.isMoment(program.from) ){
        executionHeader += "-From:";
        executionHeader += program.from.format("YYYY-MM-DD hh:mm:ss");
    }

    if( moment.isMoment(program.to) ){
        executionHeader += "-To:";
        executionHeader += program.to.format("YYYY-MM-DD hh:mm:ss");
    }

    if( program.propertyCode ){
        executionHeader += "-Property Code:";
        executionHeader += program.propertyCode;
    }

    if( program.rateCode ){
        executionHeader += "-RateCode:";
        executionHeader += program.rateCode;
    }

    if( program.roomType ){
        executionHeader += "-RoomType:";
        executionHeader += program.roomType;
    }
    console.log(executionHeader);
}

function printHeader(sample){
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

function printData(item){
    if( item ){
        var keys = Object.keys(item);
        var line = "";
        for( var i in keys ){
            var key = keys[i];
            var value = item[key];
            if( moment.isMoment(value) ){
                value = value.format("YYYY-MM-DD");
            }
            line += value;
            if( i < keys.length ){
                line += program.delimiter || "|";
            }
        }
        console.log(line);
    }
}

function mapMessageType(messageType){
    if( typeof messageType === "string" ){
        switch(messageType.toLowerCase()){
            case "rate":
                return "OTA_HotelRatePlanNotifRQ";
            case "avail":
            case "availability":
                return "OTA_HotelAvailNotifRQ";
            default:
                return messageType;
        }
    } else {
        return messageType;
    }
}

function handleError(err){
    console.error(err);
}