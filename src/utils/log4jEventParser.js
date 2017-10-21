/* jshint esversion:6 */
const moment = require("moment");
const LogfilePatterns = require("./logfilePatterns");

function Log4JEventParser(){
    var events = [];
    var lineCount = 0;
    this.parse = function parse(line){
        var logLevel = LogfilePatterns.LOGLEVEL.exec(line);
        var timestamp = LogfilePatterns.LOGTIMESTAMP.exec(line);
        var altTimestamp = LogfilePatterns.ALT_TIMESTAMP.exec(line);
        var classTrace = LogfilePatterns.CLASSTRACE.exec(line);

        var logLevelEnd = (logLevel)?logLevel.index+logLevel[0].length:0;
        var timestampEnd = (timestamp)?timestamp.index+timestamp[0].length:0;        

        var dataStart = timestampEnd || logLevelEnd || 0;
        var dataEnd = (classTrace)?classTrace.index:0 || line.length;

        var timestampValue = null;
        if( timestamp ){
            timestampValue = moment(timestamp[0].trim(),"MM-DD hh:mm:ss");
        } else if( altTimestamp ){
            timestampValue = moment(altTimestamp[0].trim(), "MMM DD,YYYY hh:mm:ss A" );
        }

        var data = line.substring(dataStart, dataEnd).trim();
        var event = {
            logLevel : (logLevel)?logLevel[0].trim():null,
            timestamp : timestampValue,
            line: ++lineCount,
            data : data,
            raw : line
        };
        events.push(event);
        return event;
    };

    this.parsed = function parsed(){
        return events.filter((event)=>event);
    }
}

module.exports = Log4JEventParser;